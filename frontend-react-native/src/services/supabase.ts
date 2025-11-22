/**
 * Supabase Authentication Service
 * Unified authentication for React Native (iOS/Android) and Web
 *
 * Provides:
 * - Sign in / Sign up
 * - Session management
 * - Token refresh
 * - Multi-platform support
 */

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://txlzlhcrfippujcmnief.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bHpsaGNyZmlwcHVqY21uaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTk3MzcsImV4cCI6MjA0OTQzNTczN30.YkZV-aqBT_F86PEhxW_9s48cTn-M16FZVWZlwkIPmek';

// Storage configuration for auth tokens
const getStorage = (): {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
} => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    return {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(key);
      },
    };
  } else {
    // Use AsyncStorage for mobile
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }
};

// Create Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Authentication service
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (__DEV__) {
        console.error('Sign in error:', error);
      }
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  }

  /**
   * Sign up with email and password
   */
  static async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      if (__DEV__) {
        console.error('Sign up error:', error);
      }
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      if (__DEV__) {
        console.error('Sign out error:', error);
      }
    }

    return { error };
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      if (__DEV__) {
        console.error('Get session error:', error);
      }
      return { session: null, error };
    }

    return { session: data.session, error: null };
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (__DEV__) {
        console.error('Get user error:', error);
      }
      return { user: null, error };
    }

    return { user: data.user, error: null };
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void): {
    data: { subscription: { unsubscribe: () => void } };
  } {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Reset password (send reset email)
   */
  static async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        Platform.OS === 'web'
          ? `${window.location.origin}/reset-password`
          : 'cerebral://reset-password',
    });

    if (error) {
      if (__DEV__) {
        console.error('Reset password error:', error);
      }
    }

    return { error };
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (__DEV__) {
        console.error('Update password error:', error);
      }
    }

    return { error };
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getSession();
    return session !== null;
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    const { session } = await this.getSession();
    return session?.access_token ?? null;
  }
}

export default AuthService;
