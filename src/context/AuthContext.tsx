import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { store } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    username: string;
    full_name: string;
    password?: string;
    avatar_url?: string;
    invite_code?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  switchUser: (userId: string) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const savedUserId = localStorage.getItem('fh_active_user_id');
    const profiles = store.getProfiles();

    if (savedUserId) {
      const found = profiles.find((p) => p.id === savedUserId && p.is_active);
      if (found) {
        setCurrentUser(found);
      } else {
        // Default to first active admin
        setCurrentUser(profiles[0] || null);
      }
    } else {
      // Default to first active user (Tanvir - Admin)
      const defaultUser = profiles[0] || null;
      if (defaultUser) {
        setCurrentUser(defaultUser);
        localStorage.setItem('fh_active_user_id', defaultUser.id);
      }
    }
    setLoading(false);

    // Subscribe to store updates
    const unsub = store.subscribe(() => {
      const currentId = localStorage.getItem('fh_active_user_id');
      if (currentId) {
        const fresh = store.getProfile(currentId);
        if (fresh) setCurrentUser(fresh);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password || 'password123',
        });
        if (error) {
          // Check if fallback to local profile matches
          const localMatch = store.getProfiles().find(
            (p) => p.email.toLowerCase() === email.toLowerCase() && p.is_active
          );
          if (localMatch) {
            setCurrentUser(localMatch);
            localStorage.setItem('fh_active_user_id', localMatch.id);
            setLoading(false);
            return { success: true };
          }
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          let profile = store.getProfile(data.user.id);
          if (!profile) {
            profile = store.addProfile({
              id: data.user.id,
              email: data.user.email || email,
              username: email.split('@')[0],
              full_name: data.user.user_metadata?.full_name || email.split('@')[0],
              role: 'member',
              is_active: true,
              location_sharing_enabled: false,
              privacy_mode: 'exact',
              online_status: 'online',
              last_seen: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
          setCurrentUser(profile);
          localStorage.setItem('fh_active_user_id', profile.id);
          setLoading(false);
          return { success: true };
        }
      }

      // Local store authentication logic
      const profile = store.getProfiles().find(
        (p) => p.email.toLowerCase() === email.toLowerCase() || p.username.toLowerCase() === email.toLowerCase()
      );

      if (!profile) {
        setLoading(false);
        return { success: false, error: 'Member not found. Please verify your email or username.' };
      }

      if (!profile.is_active) {
        setLoading(false);
        return { success: false, error: 'Your account has been deactivated by community administrators.' };
      }

      // Update last seen and online
      const updated = store.updateProfile(profile.id, {
        online_status: 'online',
        last_seen: new Date().toISOString(),
      });

      setCurrentUser(updated);
      localStorage.setItem('fh_active_user_id', updated.id);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const register = async (data: {
    email: string;
    username: string;
    full_name: string;
    password?: string;
    avatar_url?: string;
    invite_code?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const settings = store.getSettings();
      if (!settings.allow_member_invites && data.invite_code !== settings.invite_code) {
        setLoading(false);
        return {
          success: false,
          error: `Invalid community invite code. Please contact an admin for an invitation.`,
        };
      }

      // Check existing email/username
      const existing = store.getProfiles().find(
        (p) =>
          p.email.toLowerCase() === data.email.toLowerCase() ||
          p.username.toLowerCase() === data.username.toLowerCase()
      );

      if (existing) {
        setLoading(false);
        return { success: false, error: 'An account with this email or username already exists.' };
      }

      const newId = `usr-${Date.now()}`;
      const defaultAvatar =
        data.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.username)}`;

      const newProfile: UserProfile = {
        id: newId,
        email: data.email,
        username: data.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        full_name: data.full_name,
        avatar_url: defaultAvatar,
        role: 'member',
        is_active: true,
        location_sharing_enabled: false, // OFF by default as required
        privacy_mode: 'exact',
        online_status: 'online',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.addProfile(newProfile);
      setCurrentUser(newProfile);
      localStorage.setItem('fh_active_user_id', newId);

      // Create community announcement
      store.createPost({
        user_id: newId,
        content: `👋 Hey everyone! I just joined FriendsHub. Excited to connect with you all!`,
        post_type: 'post',
      });

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    if (currentUser) {
      store.updateProfile(currentUser.id, {
        online_status: 'offline',
        last_seen: new Date().toISOString(),
      });
    }
    localStorage.removeItem('fh_active_user_id');
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true, message: `Password reset link has been dispatched to ${email}.` };
    }
    // Simulation
    const exists = store.getProfiles().some((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      return { success: false, error: 'No member found registered with this email address.' };
    }
    return {
      success: true,
      message: `Password reset instructions sent to ${email}. Check your inbox or follow the reset prompt.`,
    };
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = store.updateProfile(currentUser.id, updates);
    setCurrentUser(updated);
  };

  const switchUser = (userId: string) => {
    const profile = store.getProfile(userId);
    if (profile) {
      setCurrentUser(profile);
      localStorage.setItem('fh_active_user_id', userId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: currentUser?.role === 'admin',
        loading,
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
