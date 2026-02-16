/**
 * Authentication Screen
 * Demonstrates OAuth and email/password authentication flow
 * Works on iOS, Android, and Web
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { AuthService } from '@cerebral/core';
import { appColors } from '../config/colors';

export function AuthScreen({ onAuthStateChange }: { onAuthStateChange?: () => void }) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'oauth'>('oauth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await AuthService.getUser();
      setUser(user);
    };

    checkAuth();

    // Listen to auth state changes
    const unsubscribe = AuthService.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      onAuthStateChange?.();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user, error } = await AuthService.signIn(email, password);

      if (error) {
        setError(error.message);
      } else if (user) {
        setEmail('');
        setPassword('');
        onAuthStateChange?.();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user, error } = await AuthService.signUp(email, password);

      if (error) {
        setError(error.message);
      } else if (user) {
        setAuthMode('login');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { url, error } = await AuthService.signInWithGitHub();

      if (error) {
        setError(error.message);
      } else if (url) {
        if (Platform.OS === 'web') {
          // Web: redirect to GitHub
          window.location.href = url;
        } else {
          // Mobile: open in browser with deep link
          await Linking.openURL(url);
        }
      }
    } catch (err: any) {
      setError(err.message || 'GitHub login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { url, error } = await AuthService.signInWithGoogle();

      if (error) {
        setError(error.message);
      } else if (url) {
        if (Platform.OS === 'web') {
          // Web: redirect to Google
          window.location.href = url;
        } else {
          // Mobile: open in browser with deep link
          await Linking.openURL(url);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await AuthService.signOut();

    if (error) {
      setError(error.message);
    } else {
      setUser(null);
      onAuthStateChange?.();
    }

    setLoading(false);
  };

  if (user) {
    return (
      <ScrollView style={{ flex: 1, padding: 16, backgroundColor: appColors.background }}>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Welcome!</Text>

          <View
            style={{
              backgroundColor: appColors.surface,
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, color: appColors.textSecondary, marginBottom: 8 }}>
              Email
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 16 }}>{user.email}</Text>

            <Text style={{ fontSize: 14, color: appColors.textSecondary, marginBottom: 8 }}>
              User ID
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'monospace', marginBottom: 16 }}>
              {user.id}
            </Text>

            <TouchableOpacity
              onPress={handleLogout}
              disabled={loading}
              style={{
                backgroundColor: appColors.danger,
                padding: 12,
                borderRadius: 6,
                alignItems: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color={appColors.surface} />
              ) : (
                <Text style={{ color: appColors.surface, fontWeight: '600' }}>Logout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: appColors.background }}>
      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          Cerebral
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: appColors.textSecondary,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          Authenticate to continue
        </Text>

        {/* OAuth Section */}
        {authMode === 'oauth' && (
          <View>
            <TouchableOpacity
              onPress={handleGitHubLogin}
              disabled={loading}
              style={{
                backgroundColor: appColors.github,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator color={appColors.surface} />
              ) : (
                <Text style={{ color: appColors.surface, fontWeight: '600' }}>
                  Sign in with GitHub
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              style={{
                backgroundColor: appColors.google,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator color={appColors.surface} />
              ) : (
                <Text style={{ color: appColors.surface, fontWeight: '600' }}>
                  Sign in with Google
                </Text>
              )}
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: appColors.separator }} />
              <Text style={{ marginHorizontal: 8, color: appColors.textSecondary }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: appColors.separator }} />
            </View>

            <TouchableOpacity
              onPress={() => setAuthMode('login')}
              style={{
                backgroundColor: appColors.background,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: appColors.github, fontWeight: '600' }}>Email & Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Email/Password Section */}
        {(authMode === 'login' || authMode === 'signup') && (
          <View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              style={{
                backgroundColor: appColors.surface,
                padding: 12,
                borderRadius: 6,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: appColors.border,
              }}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              style={{
                backgroundColor: appColors.surface,
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: appColors.border,
              }}
            />

            <TouchableOpacity
              onPress={authMode === 'login' ? handleEmailLogin : handleEmailSignup}
              disabled={loading}
              style={{
                backgroundColor: appColors.brand,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator color={appColors.surface} />
              ) : (
                <Text style={{ color: appColors.surface, fontWeight: '600' }}>
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              style={{
                backgroundColor: appColors.background,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: appColors.github, fontWeight: '600' }}>
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAuthMode('oauth')}>
              <Text style={{ color: appColors.brand, textAlign: 'center', fontWeight: '600' }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View
            style={{
              backgroundColor: appColors.errorBackground,
              padding: 12,
              borderRadius: 6,
              marginTop: 16,
            }}
          >
            <Text style={{ color: appColors.errorText }}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default AuthScreen;
