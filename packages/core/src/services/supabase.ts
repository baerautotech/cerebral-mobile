/**
 * Supabase Authentication Service
 * Cross-platform support: React Native (iOS/Android) + Web
 *
 * Provides:
 * - Email/password authentication
 * - OAuth (GitHub, Google)
 * - Session management
 * - Token refresh
 * - Multi-platform storage (AsyncStorage for mobile, localStorage for web)
 */

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const SUPABASE_URL = 'https://txlzlhcrfippujcmnief.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bHpsaGNyZmlwcHVqY21uaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTk3MzcsImV4cCI6MjA0OTQzNTczN30.YkZV-aqBT_F86PEhxW_9s48cTn-M16FZVWZlwkIPmek';

// Detect if running on web or native
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// Storage adapter based on platform
const getStorageAdapter = () => {
  if (isWeb) {
    return {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Silently fail
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Silently fail
        }
      },
    };
  } else {
    // React Native - use AsyncStorage
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }
};

// Create Supabase client with platform-specific configuration
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: getStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: isWeb, // Only detect session in URL on web
    },
  }
);

/**
 * Authentication Service
 * Provides unified authentication API across all platforms
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('[AuthService] Sign in error:', error);
      return { user: null, session: null, error };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('[AuthService] Sign up error:', error);
      return { user: null, session: null, error };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('[AuthService] Sign out error:', error);
      return { error };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error: any) {
      console.error('[AuthService] Get session error:', error);
      return { session: null, error };
    }
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('[AuthService] Get user error:', error);
      return { user: null, error };
    }
  }

  /**
   * Listen to auth state changes
   * Returns unsubscribe function
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): (() => void) | null {
    const subscription = supabase.auth.onAuthStateChange(callback);
    return subscription?.data?.subscription?.unsubscribe ?? null;
  }

  /**
   * Sign in with GitHub OAuth
   */
  static async signInWithGitHub(): Promise<{ url?: string; error: Error | null }> {
    try {
      const redirectTo = isWeb
        ? `${window.location.origin}/auth/callback`
        : 'cerebral://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
          skipBrowserRedirect: !isWeb, // Mobile should handle redirect manually
        },
      });

      if (error) throw error;

      return { url: data?.url, error: null };
    } catch (error: any) {
      console.error('[AuthService] GitHub sign in error:', error);
      return { error };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<{ url?: string; error: Error | null }> {
    try {
      const redirectTo = isWeb
        ? `${window.location.origin}/auth/callback`
        : 'cerebral://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: !isWeb, // Mobile should handle redirect manually
        },
      });

      if (error) throw error;

      return { url: data?.url, error: null };
    } catch (error: any) {
      console.error('[AuthService] Google sign in error:', error);
      return { error };
    }
  }

  /**
   * Handle OAuth callback
   * For web: automatically handled by Supabase
   * For mobile: call after deep link is triggered
   */
  static async handleOAuthCallback(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      return { user: data.session?.user ?? null, error: null };
    } catch (error: any) {
      console.error('[AuthService] OAuth callback error:', error);
      return { user: null, error };
    }
  }

  /**
   * Reset password (send reset email)
   */
  static async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const redirectTo = isWeb
        ? `${window.location.origin}/reset-password`
        : 'cerebral://reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('[AuthService] Reset password error:', error);
      return { error };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('[AuthService] Update password error:', error);
      return { error };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getSession();
    return session !== null;
  }

  /**
   * Get access token (JWT)
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const { session } = await this.getSession();
      return session?.access_token ?? null;
    } catch {
      return null;
    }
  }
}

export default AuthService;
