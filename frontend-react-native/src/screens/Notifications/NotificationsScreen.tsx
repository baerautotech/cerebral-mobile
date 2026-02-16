import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import backendClient from '../../services/BackendClient';
import type { components } from '../../types/backend-api';

type Notification = components['schemas']['Notification'];

type NotificationPreferences = {
  channels: Record<string, boolean>;
};

export default function NotificationsScreen(): React.ReactElement {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: { email: true, push: true, sms: false, webhook: false },
  });
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendClient.getNotifications(30, 0, false);
      setNotifications(response.notifications ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load notifications',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    setPrefsError(null);
    try {
      const response = await backendClient.getNotificationPreferences();
      setPreferences({ channels: response.channels ?? {} });
    } catch (err) {
      setPrefsError(
        err instanceof Error ? err.message : 'Failed to load preferences',
      );
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    void loadPreferences();
  }, [loadNotifications, loadPreferences]);

  const handleMarkRead = useCallback(async (notification: Notification) => {
    if (!notification.id || notification.read) return;
    try {
      await backendClient.markNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(item =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to mark notification read',
      );
    }
  }, []);

  const handleTogglePreference = useCallback(
    async (channel: string, nextValue: boolean) => {
      const next = {
        channels: {
          ...preferences.channels,
          [channel]: nextValue,
        },
      };
      setPreferences(next);
      try {
        await backendClient.updateNotificationPreferences(next.channels);
      } catch (err) {
        setPreferences(prev => prev);
        setPrefsError(
          err instanceof Error ? err.message : 'Failed to update preferences',
        );
      }
    },
    [preferences.channels],
  );

  const channels = useMemo(
    () => Object.entries(preferences.channels),
    [preferences.channels],
  );

  const renderItem = ({ item }: { item: Notification }): React.ReactElement => (
    <Pressable
      onPress={() => void handleMarkRead(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {item.title ?? item.message ?? 'Notification'}
        </Text>
        {!item.read ? <Text style={styles.badge}>NEW</Text> : null}
      </View>
      {item.message ? (
        <Text style={styles.cardBody}>{item.message}</Text>
      ) : null}
    </Pressable>
  );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={notifications}
      keyExtractor={(item, index) => item.id ?? `${index}`}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Notifications</Text>
            <Pressable onPress={() => void loadNotifications()}>
              <Text style={styles.link}>Refresh</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>Unread: {unreadCount}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            {prefsError ? <Text style={styles.error}>{prefsError}</Text> : null}
            {channels.map(([channel, enabled]) => (
              <View key={channel} style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>
                  {channel.toUpperCase()}
                </Text>
                <Switch
                  value={Boolean(enabled)}
                  onValueChange={value =>
                    void handleTogglePreference(channel, value)
                  }
                />
              </View>
            ))}
          </View>

          {loading ? <Text style={styles.muted}>Loading…</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!loading && notifications.length === 0 ? (
            <Text style={styles.muted}>No notifications yet.</Text>
          ) : null}
        </View>
      }
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgb(156, 163, 175)',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgb(17, 24, 39)',
  },
  preferenceLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgb(15, 23, 42)',
    borderWidth: 1,
    borderColor: 'rgb(31, 41, 55)',
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgb(249, 250, 251)',
  },
  cardBody: {
    fontSize: 12,
    color: 'rgb(203, 213, 245)',
  },
  badge: {
    fontSize: 10,
    color: 'rgb(245, 158, 11)',
    fontWeight: '700',
  },
  link: {
    fontSize: 12,
    color: 'rgb(125, 211, 252)',
    fontWeight: '600',
  },
  muted: {
    fontSize: 12,
    color: 'rgb(156, 163, 175)',
  },
  error: {
    fontSize: 12,
    color: 'rgb(248, 113, 113)',
  },
});
