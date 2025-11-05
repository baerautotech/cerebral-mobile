/**
 * Authentication Screen
 * Demonstrates OAuth and email/password authentication flow
 * Works on iOS, Android, and Web
 */

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
    const unsubscribe = AuthService.onAuthStateChange((event, session) => {
      console.log('[AuthScreen] Auth event:', event);
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
        console.log('✅ Logged in:', user.email);
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
        console.log('✅ Account created:', user.email);
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
        console.log('🔗 GitHub OAuth URL:', url);

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
        console.log('🔗 Google OAuth URL:', url);

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
      console.log('✅ Logged out');
      setUser(null);
      onAuthStateChange?.();
    }

    setLoading(false);
  };

  if (user) {
    return (
      <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Welcome!
          </Text>

          <View
            style={{
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Email</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
              {user.email}
            </Text>

            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>User ID</Text>
            <Text style={{ fontSize: 12, fontFamily: 'monospace', marginBottom: 16 }}>
              {user.id}
            </Text>

            <TouchableOpacity
              onPress={handleLogout}
              disabled={loading}
              style={{
                backgroundColor: '#ff3b30',
                padding: 12,
                borderRadius: 6,
                alignItems: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          Cerebral
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 32, textAlign: 'center' }}>
          Authenticate to continue
        </Text>

        {/* OAuth Section */}
        {authMode === 'oauth' && (
          <View>
            <TouchableOpacity
              onPress={handleGitHubLogin}
              disabled={loading}
              style={{
                backgroundColor: '#1f2937',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Sign in with GitHub</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              style={{
                backgroundColor: '#4285f4',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Sign in with Google</Text>
              )}
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
              <Text style={{ marginHorizontal: 8, color: '#666' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            </View>

            <TouchableOpacity
              onPress={() => setAuthMode('login')}
              style={{
                backgroundColor: '#f3f4f6',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#1f2937', fontWeight: '600' }}>Email & Password</Text>
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
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 6,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />

            <TouchableOpacity
              onPress={authMode === 'login' ? handleEmailLogin : handleEmailSignup}
              disabled={loading}
              style={{
                backgroundColor: '#3b82f6',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              style={{
                backgroundColor: '#f3f4f6',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#1f2937', fontWeight: '600' }}>
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAuthMode('oauth')}>
              <Text style={{ color: '#3b82f6', textAlign: 'center', fontWeight: '600' }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View
            style={{
              backgroundColor: '#fee2e2',
              padding: 12,
              borderRadius: 6,
              marginTop: 16,
            }}
          >
            <Text style={{ color: '#dc2626' }}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default AuthScreen;










