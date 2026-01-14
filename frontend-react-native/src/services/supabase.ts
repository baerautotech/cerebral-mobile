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

import type { Session, User } from '@supabase/supabase-js';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env } from '../config/env';

type StorageAdapter = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

/**
 * Web storage MUST NOT be localStorage/sessionStorage for auth tokens.
 * Use in-memory storage so sessions (when used at all on web) are ephemeral.
 */
const createWebMemoryStorage = (): StorageAdapter => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
};

// Storage configuration for auth tokens
//
// SECURITY PLANE v1 default: do not persist auth tokens client-side.
// - Web: never use localStorage/sessionStorage for tokens
// - Native: do not store refresh/access tokens in AsyncStorage
//
// This uses in-memory storage on all platforms by default.
//
// Break-glass (dev only): if SUPABASE_INSECURE_PERSIST_SESSION=true, we allow AsyncStorage-based
// persistence on native platforms only. This MUST NOT be enabled in shared/staging/prod.
const allowInsecurePersist =
  Platform.OS !== 'web' &&
  process.env.SUPABASE_INSECURE_PERSIST_SESSION === 'true';

const getStorage = (): StorageAdapter => {
  if (!allowInsecurePersist) return createWebMemoryStorage();

  // Insecure storage fallback (dev only).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AsyncStorage =
    require('@react-native-async-storage/async-storage').default;
  return {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
    removeItem: (key: string) => AsyncStorage.removeItem(key),
  };
};

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: getStorage(),
      // Browser portals must not persist tokens; cookie auth is the platform contract.
      autoRefreshToken: allowInsecurePersist,
      persistSession: allowInsecurePersist,
      // Web still needs to process auth fragments, but only in-memory.
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);

// Authentication service
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(
    email: string,
    password: string,
  ): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }> {
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
    metadata?: Record<string, unknown>,
  ): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }> {
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

  static async signInWithSSO(options?: {
    redirectTo?: string;
  }): Promise<{ url?: string; error: Error | null }> {
    const redirectTo =
      options?.redirectTo ??
      (Platform.OS === 'web'
        ? `${window.location.origin}/auth/callback`
        : 'cerebral://auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      // Supabase's generic OIDC slot is named "keycloak" in the API.
      provider: 'keycloak',
      options: { redirectTo },
    });

    if (error) {
      if (__DEV__) console.error('SSO sign in error:', error);
      return { error };
    }

    return { url: data.url, error: null };
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
  static async getSession(): Promise<{
    session: Session | null;
    error: Error | null;
  }> {
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
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void,
  ): {
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
  static async updatePassword(
    newPassword: string,
  ): Promise<{ error: Error | null }> {
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
