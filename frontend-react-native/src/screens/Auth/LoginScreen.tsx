/**
 * Login Screen
 * Unified authentication screen for web and mobile
 *
 * Features:
 * - Email/password authentication
 * - Responsive design
 * - Platform-aware UI
 * - Supabase integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';

import { AuthService } from '../../services/supabase';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onNavigateToSignup?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
}) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, _setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    _setLoading(true);

    try {
      const {
        user,
        session,
        error: signInError,
      } = await AuthService.signIn(email, password);

      if (signInError) {
        setError(signInError.message ?? 'Login failed');
        return;
      }

      if (user && session) {
        onLoginSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      if (__DEV__) {
        console.error('Login error:', err);
      }
    } finally {
      _setLoading(false);
    }
  };

  const handleSSOLogin = async (): Promise<void> => {
    setError(null);
    _setLoading(true);
    try {
      const { url, error: ssoErr } = await AuthService.signInWithSSO();
      if (ssoErr) {
        setError(ssoErr.message ?? 'SSO login failed');
        return;
      }
      if (!url) {
        setError('SSO login failed (no redirect URL returned)');
        return;
      }
      // Native: open browser for OIDC; deep link should return to the app.
      await Linking.openURL(url);
    } catch (err) {
      setError('SSO login failed');
      if (__DEV__) console.error('SSO login error:', err);
    } finally {
      _setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    setError(null);
    if (!email) {
      setError('Enter your email to reset your password');
      return;
    }
    try {
      const { error } = await AuthService.resetPassword(email);
      if (error) {
        setError(error.message ?? 'Password reset failed');
        return;
      }
      setError('Password reset email sent');
    } catch (err) {
      setError('Password reset failed');
      if (__DEV__) console.error('Password reset error:', err);
    }
  };

  const containerStyle = [
    styles.container,
    isWeb && !isMobile && styles.containerDesktop,
  ];

  const formStyle = [styles.form, isWeb && !isMobile && styles.formDesktop];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={containerStyle}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🧠</Text>
            <Text style={styles.title}>Cerebral Platform</Text>
            <Text style={styles.subtitle}>Enterprise AI/ML Management</Text>
          </View>

          {/* Login Form */}
          <View style={formStyle}>
            <Text style={styles.formTitle}>Sign In</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {!isWeb && (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSSOLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Login with SSO (Zitadel)</Text>
              </TouchableOpacity>
            )}

            {/* Footer Links */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.linkText}>Forgot password?</Text>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateToSignup}>
                  <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Platform Badge */}
          {isWeb && (
            <Text style={styles.platformBadge}>
              Web · Powered by React Native Web
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  containerDesktop: {
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  formDesktop: {
    maxWidth: 450,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    height: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformBadge: {
    marginTop: 40,
    fontSize: 12,
    color: '#666',
  },
});

export default LoginScreen;
