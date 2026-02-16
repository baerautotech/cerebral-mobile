import { StyleSheet } from 'react-native';

export const ACCOUNT_COLORS = {
  textPrimary: 'white',
  textMuted: 'rgb(153, 153, 153)',
  textPlaceholder: 'rgb(102, 102, 102)',
  surface: 'rgb(26, 26, 26)',
  surfaceDark: 'rgb(17, 17, 17)',
  border: 'rgb(51, 51, 51)',
  accent: 'rgb(0, 122, 255)',
  accentMuted: 'rgb(34, 34, 34)',
  error: 'rgb(255, 68, 68)',
};

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: ACCOUNT_COLORS.textPrimary,
  },
  card: {
    backgroundColor: ACCOUNT_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.border,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCOUNT_COLORS.textPrimary,
  },
  label: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textMuted,
  },
  value: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textPrimary,
  },
  helper: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textMuted,
  },
  input: {
    height: 48,
    backgroundColor: ACCOUNT_COLORS.surfaceDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.border,
    paddingHorizontal: 12,
    color: ACCOUNT_COLORS.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: ACCOUNT_COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: ACCOUNT_COLORS.accentMuted,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: ACCOUNT_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: ACCOUNT_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    color: ACCOUNT_COLORS.error,
  },
  status: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textMuted,
  },
});
