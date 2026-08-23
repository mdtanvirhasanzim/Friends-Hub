import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../types';
import { store } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    username: string;
    full_name: string;
    password?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    invite_code?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateCurrentUser: (updates: Partial<UserProfile>) => Promise<void>;
  switchUser: (userId: string) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const presenceChannelRef = useRef<any>(null);

  // Sync profile from Supabase or Fallback Store
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error) {
          return data as UserProfile;
        }
      } catch (err) {
        console.warn('[AuthContext] Error fetching Supabase profile:', err);
      }
    }
    return store.getProfile(userId) || null;
  }, []);

  // Set up Supabase Presence & Online/Offline status tracker
  const setupPresence = useCallback((user: UserProfile) => {
    if (!isSupabaseConfigured || !supabase) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    const channel = supabase.channel('online-members', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUserIds = Object.keys(state);
        // Sync online status in store
        store.syncOnlinePresence(onlineUserIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            user_name: user.full_name,
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = channel;

    // Update online status in database
    supabase
      .from('profiles')
      .update({ online_status: 'online', last_seen: new Date().toISOString() })
      .eq('id', user.id)
      .then();
  }, []);

  // Initialize Session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            if (profile && isMounted) {
              setCurrentUser(profile);
              localStorage.setItem('fh_active_user_id', profile.id);
              setupPresence(profile);
            }
          }
        } catch (err) {
          console.warn('[Auth] Supabase session check error:', err);
        }
      }

      // If no Supabase user or fallback mode, check local store
      if (isMounted && !currentUser) {
        const savedUserId = localStorage.getItem('fh_active_user_id');
        const profiles = store.getProfiles();

        if (savedUserId) {
          const found = profiles.find((p) => p.id === savedUserId && p.is_active);
          if (found) {
            setCurrentUser(found);
          } else {
            setCurrentUser(profiles[0] || null);
          }
        } else {
          const defaultUser = profiles[0] || null;
          if (defaultUser) {
            setCurrentUser(defaultUser);
            localStorage.setItem('fh_active_user_id', defaultUser.id);
          }
        }
      }

      if (isMounted) setLoading(false);
    }

    initAuth();

    // Supabase Auth State Change Listener
    let authListenerSub: any = null;
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile && isMounted) {
            setCurrentUser(profile);
            localStorage.setItem('fh_active_user_id', profile.id);
            setupPresence(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setCurrentUser(null);
            localStorage.removeItem('fh_active_user_id');
          }
        }
      });
      authListenerSub = authListener.subscription;
    }

    // Subscribe to store updates
    const unsubStore = store.subscribe(() => {
      if (!isMounted) return;
      const currentId = localStorage.getItem('fh_active_user_id');
      if (currentId) {
        const fresh = store.getProfile(currentId);
        if (fresh) setCurrentUser(fresh);
      }
    });

    // Window beforeunload presence cleanup
    const handleUnload = () => {
      if (currentUser && isSupabaseConfigured && supabase) {
        supabase
          .from('profiles')
          .update({ online_status: 'offline', last_seen: new Date().toISOString() })
          .eq('id', currentUser.id)
          .then();
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      isMounted = false;
      if (authListenerSub) authListenerSub.unsubscribe();
      unsubStore();
      window.removeEventListener('beforeunload', handleUnload);
      if (presenceChannelRef.current && supabase) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [fetchProfile, setupPresence]);

  // Login handler
  const login = async (emailOrUsername: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const identifier = emailOrUsername.trim().toLowerCase();

    // If Supabase is active
    if (isSupabaseConfigured && supabase) {
      try {
        let emailToUse = identifier;

        // If username was provided, find corresponding email in profiles table
        if (!identifier.includes('@')) {
          const { data: profileByUsername } = await supabase
            .from('profiles')
            .select('id, email')
            .ilike('username', identifier)
            .maybeSingle();

          if (profileByUsername?.email) {
            emailToUse = profileByUsername.email;
          }
        }

        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailToUse,
            password: password,
          });

          if (error) {
            setLoading(false);
            return { success: false, error: error.message };
          }

          if (data.user) {
            const profile = await fetchProfile(data.user.id);
            if (profile) {
              setCurrentUser(profile);
              localStorage.setItem('fh_active_user_id', profile.id);
              setupPresence(profile);
              setLoading(false);
              return { success: true };
            }
          }
        }
      } catch (err: any) {
        console.warn('[Auth] Supabase login error:', err);
      }
    }

    // Fallback store login
    try {
      const res = await store.loginUser(identifier);
      if (res.success && res.profile) {
        setCurrentUser(res.profile);
        localStorage.setItem('fh_active_user_id', res.profile.id);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: res.error || 'Member not found. Please check your username or email.' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Register handler
  const register = async (data: {
    email: string;
    username: string;
    full_name: string;
    password?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    invite_code?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    // Validate invite code
    const settings = store.getSettings();
    if (!settings.allow_member_invites && data.invite_code !== settings.invite_code) {
      setLoading(false);
      return {
        success: false,
        error: 'Invalid community invite code. Please request an invite from a circle admin.',
      };
    }

    // If Supabase is active
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password || 'FriendsHub2026!',
          options: {
            data: {
              username: cleanUsername,
              full_name: data.full_name.trim(),
              avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              bio: data.bio || 'New member in FriendsHub! 👋',
              phone: data.phone,
              invite_code: data.invite_code,
              role: 'member',
              location_sharing_enabled: true,
            },
          },
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (signUpData.user) {
          // Allow trigger to populate profile or manually upsert if needed
          let profile = await fetchProfile(signUpData.user.id);
          if (!profile) {
            const newProfileObj: UserProfile = {
              id: signUpData.user.id,
              email: cleanEmail,
              username: cleanUsername,
              full_name: data.full_name.trim(),
              avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              bio: data.bio || 'New member in FriendsHub! 👋',
              role: 'member',
              is_active: true,
              status: 'active',
              location_sharing_enabled: true,
              privacy_mode: 'exact',
              online_status: 'online',
              last_seen: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              phone: data.phone,
            };
            await supabase.from('profiles').upsert(newProfileObj);
            profile = newProfileObj;
          }

          setCurrentUser(profile);
          localStorage.setItem('fh_active_user_id', profile.id);
          setupPresence(profile);

          // Post welcome message
          store.createPost({
            user_id: profile.id,
            content: `👋 Hey everyone! I just joined FriendsHub from my device. Excited to connect!`,
            post_type: 'post',
          });

          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('[Auth] Supabase registration error:', err);
      }
    }

    // Fallback store registration
    try {
      const res = await store.registerUser({
        full_name: data.full_name,
        username: cleanUsername,
        email: cleanEmail,
        avatar_url: data.avatar_url,
        bio: data.bio,
        phone: data.phone,
        invite_code: data.invite_code,
        role: 'member',
        location_sharing_enabled: true,
      });

      if (!res.success || !res.profile) {
        setLoading(false);
        return { success: false, error: res.error || 'Registration failed' };
      }

      setCurrentUser(res.profile);
      localStorage.setItem('fh_active_user_id', res.profile.id);

      store.createPost({
        user_id: res.profile.id,
        content: `👋 Hey everyone! I just joined FriendsHub from my device. Excited to connect!`,
        post_type: 'post',
      });

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  // Logout handler
  const logout = async () => {
    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('profiles')
            .update({ online_status: 'offline', last_seen: new Date().toISOString() })
            .eq('id', currentUser.id);
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('[Auth] SignOut error:', err);
        }
      }
      store.logoutUser(currentUser.id);
    }
    if (presenceChannelRef.current && supabase) {
      supabase.removeChannel(presenceChannelRef.current);
    }
    localStorage.removeItem('fh_active_user_id');
    setCurrentUser(null);
  };

  // Reset password handler
  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: `Password reset instructions dispatched to ${email}.` };
    }

    const exists = store.getProfiles().some((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      return { success: false, error: 'No member found registered with this email address.' };
    }
    return {
      success: true,
      message: `Password reset link sent to ${email}. Check your inbox.`,
    };
  };

  // Update current user profile
  const updateCurrentUser = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', currentUser.id)
          .select()
          .single();

        if (data && !error) {
          setCurrentUser(data as UserProfile);
        }
      } catch (err) {
        console.warn('[Auth] Update profile Supabase error:', err);
      }
    }

    const updated = store.updateProfile(currentUser.id, updates);
    setCurrentUser(updated);
  };

  // Switch demo user (for fast multi-account testing)
  const switchUser = (userId: string) => {
    const profile = store.getProfile(userId);
    if (profile) {
      setCurrentUser(profile);
      localStorage.setItem('fh_active_user_id', userId);
      setupPresence(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: currentUser?.role === 'admin',
        loading,
        isLoading: loading,
        login,
        register,
        logout,
        resetPassword,
        updateCurrentUser,
        switchUser,
        isSupabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
