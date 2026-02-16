import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthService } from '../services/supabase';
import { onStepUpRequired, type StepUpPayload } from '../services/stepUpBus';

const getReturnTo = (): string => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '/';
  return window.location.href;
};

const setGlobalHref = (href: string): void => {
  const g = globalThis as unknown as {
    window?: Window;
    global?: { window?: Window };
  };
  if (g.window?.location) g.window.location.href = href;
  if (g.global?.window?.location) g.global.window.location.href = href;
};

export default function StepUpRequiredModal(): React.ReactElement {
  const [payload, setPayload] = useState<StepUpPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = Boolean(payload);

  useEffect(() => {
    return onStepUpRequired(next => {
      setPayload(next);
      setError(null);
    });
  }, []);

  const handleDismiss = useCallback(() => {
    setPayload(null);
    setError(null);
  }, []);

  const handleContinue = useCallback(async () => {
    setError(null);
    try {
      const redirectTo =
        Platform.OS === 'web' ? `${getReturnTo()}` : 'cerebral://auth/callback';

      const { url, error: ssoErr } = await AuthService.signInWithSSO({
        redirectTo,
      });
      if (ssoErr) {
        setError(ssoErr.message ?? 'SSO login failed');
        return;
      }
      if (!url) {
        setError('SSO login failed (no redirect URL returned)');
        return;
      }

      if (Platform.OS === 'web') {
        setGlobalHref(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      setError('SSO login failed');
      if (__DEV__) console.error('Step-up SSO login failed:', err);
    }
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Step-up required</Text>
          <Text style={styles.body}>
            {payload?.message ??
              'Additional verification is required to proceed.'}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.primary]}
              onPress={handleContinue}
            >
              <Text style={styles.primaryText}>Continue to SSO</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleDismiss}>
              <Text style={styles.secondaryText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgb(11, 18, 32)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgb(249, 250, 251)',
  },
  body: {
    fontSize: 14,
    color: 'rgb(203, 213, 245)',
  },
  error: {
    fontSize: 12,
    color: 'rgb(248, 113, 113)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgb(31, 41, 55)',
  },
  primary: {
    backgroundColor: 'rgb(37, 99, 235)',
  },
  primaryText: {
    color: 'rgb(249, 250, 251)',
    fontWeight: '700',
    fontSize: 12,
  },
  secondaryText: {
    color: 'rgb(229, 231, 235)',
    fontWeight: '600',
    fontSize: 12,
  },
});
