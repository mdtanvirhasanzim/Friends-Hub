import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { UserProfile } from '../types';
import { store } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; username: string; full_name: string; password?: string; avatar_url?: string; bio?: string; phone?: string; invite_code?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateCurrentUser: (updates: Partial<UserProfile>) => Promise<void>;
  switchUser: (userId: string) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const presenceChannelRef = useRef<any>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured || !supabase || !userId) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.warn('[Auth] Profile fetch failed:', error.message);
      return null;
    }
    return data as UserProfile | null;
  }, []);

  const buildFallbackProfile = useCallback((authUser: any): UserProfile => {
    const metadata = authUser?.user_metadata || {};
    const username = String(metadata.username || authUser?.email?.split('@')[0] || `member_${String(authUser?.id || '').slice(0, 8)}`)
      .toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
    const now = new Date().toISOString();
    return {
      id: authUser.id,
      username,
      full_name: metadata.full_name || username,
      email: authUser.email || metadata.email || '',
      avatar_url: metadata.avatar_url || DEMO_AVATAR,
      bio: metadata.bio || '',
      role: metadata.role || 'member',
      status: 'active',
      is_active: true,
      online_status: true,
      location_sharing_enabled: metadata.location_sharing_enabled ?? true,
      privacy_mode: 'exact',
      last_seen: now,
      created_at: authUser.created_at || now,
      updated_at: now,
      phone: metadata.phone || undefined,
    } as UserProfile;
  }, []);

  const ensureProfile = useCallback(async (authUser: any): Promise<UserProfile | null> => {
    if (!authUser?.id || !supabase) return null;
    const existing = await fetchProfile(authUser.id);
    if (existing) return existing;

    const fallback = buildFallbackProfile(authUser);
    const { data, error } = await supabase.from('profiles').upsert(fallback, { onConflict: 'id' }).select().single();
    if (error) {
      console.warn('[Auth] Could not create missing profile:', error.message);
      return fallback;
    }
    return data as UserProfile;
  }, [fetchProfile, buildFallbackProfile]);

  const setupPresence = useCallback((user: UserProfile) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);

    const channel = supabase.channel('online-members', { config: { presence: { key: user.id } } });
    channel
      .on('presence', { event: 'sync' }, () => store.syncOnlinePresence(Object.keys(channel.presenceState())))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, user_name: user.full_name, online_at: new Date().toISOString() });
        }
      });
    presenceChannelRef.current = channel;
    void supabase.from('profiles').update({ online_status: true, last_seen: new Date().toISOString() }).eq('id', user.id);
  }, []);

  useEffect(() => {
    let mounted = true;
    const applyAuthenticatedProfile = (profile: UserProfile) => {
      setCurrentUser(profile);
      // Keep the local store in sync with the authoritative Supabase profile.
      // Otherwise a stale cached role (e.g. "member") can overwrite an updated
      // database role (e.g. "admin") immediately after login.
      store.addProfile(profile);
      localStorage.setItem('fh_active_user_id', profile.id);
      localStorage.removeItem('fh_explicit_logout');
      setupPresence(profile);
    };

    const initialize = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        const profile = await ensureProfile(session.user);
        if (profile && mounted) applyAuthenticatedProfile(profile);
      }
      setLoading(false);
    };
    void initialize();

    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
          const profile = await ensureProfile(session.user);
          if (profile && mounted) applyAuthenticatedProfile(profile);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('fh_active_user_id');
        }
      });
      authSubscription = data.subscription;
    }

    const unsubscribeStore = store.subscribe(() => {
      if (!mounted || isSupabaseConfigured) return;
      const currentId = localStorage.getItem('fh_active_user_id');
      if (currentId) {
        const fresh = store.getProfile(currentId);
        if (fresh) setCurrentUser(fresh);
      }
    });

    const handleUnload = () => {
      const currentId = localStorage.getItem('fh_active_user_id');
      if (currentId && isSupabaseConfigured && supabase) {
        void supabase.from('profiles').update({ online_status: false, last_seen: new Date().toISOString() }).eq('id', currentId);
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
      unsubscribeStore();
      window.removeEventListener('beforeunload', handleUnload);
      if (presenceChannelRef.current && supabase) supabase.removeChannel(presenceChannelRef.current);
    };
  }, [ensureProfile, setupPresence]);

  const login = async (emailOrUsername: string, password?: string) => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return { success: false, error: 'Supabase is not configured. Connect the production database first.' };
    }
    if (!password) {
      setLoading(false);
      return { success: false, error: 'Password is required.' };
    }

    try {
      const identifier = emailOrUsername.trim().toLowerCase();
      let email = identifier;
      if (!identifier.includes('@')) {
        const { data: profile, error } = await supabase.from('profiles').select('email').ilike('username', identifier).maybeSingle();
        if (error) throw error;
        if (!profile?.email) {
          setLoading(false);
          return { success: false, error: 'Account not found.' };
        }
        email = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setLoading(false);
        return { success: false, error: error?.message || 'Login failed.' };
      }

      const profile = await ensureProfile(data.user);
      if (!profile) {
        setLoading(false);
        return { success: false, error: 'Authentication succeeded, but the account profile could not be prepared.' };
      }

      setCurrentUser(profile);
      store.addProfile(profile);
      localStorage.setItem('fh_active_user_id', profile.id);
      localStorage.removeItem('fh_explicit_logout');
      setupPresence(profile);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error?.message || 'Login failed.' };
    }
  };

  const register = async (data: { email: string; username: string; full_name: string; password?: string; avatar_url?: string; bio?: string; phone?: string; invite_code?: string }) => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return { success: false, error: 'Supabase is not configured. Connect the production database first.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    try {
      const { data: settings } = await supabase.from('community_settings').select('allow_registration, allow_member_invites, invite_code').limit(1).maybeSingle();
      if (settings?.allow_registration === false) {
        setLoading(false);
        return { success: false, error: 'Registration is currently disabled by the community admin.' };
      }
      if (settings?.allow_member_invites === false && data.invite_code !== settings?.invite_code) {
        setLoading(false);
        return { success: false, error: 'A valid community invite code is required.' };
      }

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password || 'FriendsHub2026!',
        options: { data: { username: cleanUsername, full_name: data.full_name.trim(), avatar_url: data.avatar_url || DEMO_AVATAR, bio: data.bio || 'New member in FriendsHub! 👋', phone: data.phone, invite_code: data.invite_code, role: 'member', location_sharing_enabled: true } },
      });
      if (error || !signUpData.user) {
        setLoading(false);
        return { success: false, error: error?.message || 'Registration failed.' };
      }

      const profile = await ensureProfile(signUpData.user);
      if (!profile) {
        setLoading(false);
        return { success: true, error: 'Account created. Please verify your email, then log in.' };
      }

      store.addProfile(profile);
      setCurrentUser(profile);
      localStorage.setItem('fh_active_user_id', profile.id);
      setupPresence(profile);
      store.createPost({ user_id: profile.id, content: '👋 Hey everyone! I just joined FriendsHub from my device. Excited to connect!', post_type: 'post' });
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error?.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    if (currentUser && isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update({ online_status: false, last_seen: new Date().toISOString() }).eq('id', currentUser.id);
      await supabase.auth.signOut();
    }
    if (presenceChannelRef.current && supabase) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }
    localStorage.removeItem('fh_active_user_id');
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin });
    if (error) return { success: false, error: error.message };
    return { success: true, message: `Password reset instructions sent to ${email}.` };
  };

  const updateCurrentUser = async (updates: Partial<UserProfile>) => {
    if (!currentUser || !isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', currentUser.id).select().single();
    if (error) throw error;
    if (data) {
      store.addProfile(data as UserProfile);
      setCurrentUser(data as UserProfile);
    }
  };

  const switchUser = (userId: string) => {
    if (isSupabaseConfigured) return;
    const profile = store.getProfile(userId);
    if (profile) {
      setCurrentUser(profile);
      localStorage.setItem('fh_active_user_id', userId);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: Boolean(currentUser), isAdmin: currentUser?.role === 'admin', loading, isLoading: loading, login, register, logout, resetPassword, updateCurrentUser, switchUser, isSupabaseConnected: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};