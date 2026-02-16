import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthService } from '../../services/supabase';
import { ACCOUNT_COLORS, styles } from './AccountScreen.styles';

type StatusState = {
  error?: string | null;
  message?: string | null;
};

export default function AccountScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<StatusState>({});
  const [resetStatus, setResetStatus] = useState<StatusState>({});
  const [ssoStatus, setSsoStatus] = useState<StatusState>({});

  const loadUser = useCallback(async () => {
    setLoading(true);
    const { user, error } = await AuthService.getUser();
    if (error) {
      setUserEmail(null);
      setUserId(null);
    } else {
      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const handleUpdatePassword = useCallback(async () => {
    setPasswordStatus({});
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus({ error: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'Passwords do not match.' });
      return;
    }
    const { error } = await AuthService.updatePassword(newPassword);
    if (error) {
      setPasswordStatus({
        error: error.message ?? 'Unable to update password.',
      });
      return;
    }
    setPasswordStatus({ message: 'Password updated successfully.' });
    setNewPassword('');
    setConfirmPassword('');
  }, [confirmPassword, newPassword]);

  const handleSendReset = useCallback(async () => {
    setResetStatus({});
    if (!userEmail) {
      setResetStatus({ error: 'No email is available for your account.' });
      return;
    }
    const { error } = await AuthService.resetPassword(userEmail);
    if (error) {
      setResetStatus({
        error: error.message ?? 'Unable to send reset email.',
      });
      return;
    }
    setResetStatus({ message: 'Password reset email sent.' });
  }, [userEmail]);

  const handleSsoLogin = useCallback(async () => {
    setSsoStatus({});
    try {
      const redirectTo =
        Platform.OS === 'web'
          ? `${window.location.origin}/auth/callback`
          : 'cerebral://auth/callback';
      const { url, error } = await AuthService.signInWithSSO({ redirectTo });
      if (error) {
        setSsoStatus({ error: error.message ?? 'SSO login failed.' });
        return;
      }
      if (!url) {
        setSsoStatus({ error: 'SSO login failed (no redirect URL returned).' });
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      setSsoStatus({ error: 'SSO login failed.' });
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account & Security</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>
        {loading ? (
          <ActivityIndicator color={ACCOUNT_COLORS.textPrimary} />
        ) : (
          <>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userEmail ?? 'Not available'}</Text>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{userId ?? 'Not available'}</Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Password</Text>
        <Text style={styles.helper}>
          Update your password directly or send a reset link to your email.
        </Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="New password"
          placeholderTextColor={ACCOUNT_COLORS.textPlaceholder}
          style={styles.input}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm new password"
          placeholderTextColor={ACCOUNT_COLORS.textPlaceholder}
          style={styles.input}
        />
        {passwordStatus.error ? (
          <Text style={styles.error}>{passwordStatus.error}</Text>
        ) : null}
        {passwordStatus.message ? (
          <Text style={styles.status}>{passwordStatus.message}</Text>
        ) : null}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.primaryButton}
            onPress={handleUpdatePassword}
          >
            <Text style={styles.primaryButtonText}>Update Password</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleSendReset}>
            <Text style={styles.secondaryButtonText}>Send Reset Email</Text>
          </Pressable>
        </View>
        {resetStatus.error ? (
          <Text style={styles.error}>{resetStatus.error}</Text>
        ) : null}
        {resetStatus.message ? (
          <Text style={styles.status}>{resetStatus.message}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>MFA & Passkeys</Text>
        <Text style={styles.helper}>
          Managed by your organization’s identity provider (Zitadel). Use SSO to
          update MFA and passkeys.
        </Text>
        {ssoStatus.error ? (
          <Text style={styles.error}>{ssoStatus.error}</Text>
        ) : null}
        <Pressable style={styles.primaryButton} onPress={handleSsoLogin}>
          <Text style={styles.primaryButtonText}>Continue with SSO</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
