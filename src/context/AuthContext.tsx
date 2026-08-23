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
      const res = await store.loginUser(email);
      if (res.success && res.profile) {
        setCurrentUser(res.profile);
        localStorage.setItem('fh_active_user_id', res.profile.id);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: res.error || 'Member not found. Please verify your email or username.' };
      }
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

      const res = await store.registerUser({
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        avatar_url: data.avatar_url,
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

      // Create community greeting post
      store.createPost({
        user_id: res.profile.id,
        content: `👋 Hey everyone! I just joined FriendsHub from my device. Excited to connect with you all!`,
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
      store.logoutUser(currentUser.id);
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
