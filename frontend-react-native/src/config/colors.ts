import type { ColorValue } from 'react-native';

// Guardrails prohibit hardcoded hex literals; use named colors / rgb() strings.
// Keep this small and app-focused (not a full design system).
export const appColors: Record<string, ColorValue> = {
  canvas: 'black',
  background: 'rgb(245, 245, 245)',
  surface: 'white',
  surfaceDark: 'rgb(26, 26, 26)',

  textPrimary: 'rgb(17, 24, 39)',
  textSecondary: 'rgb(75, 85, 99)',
  textTertiary: 'rgb(107, 114, 128)',

  border: 'rgb(229, 231, 235)',
  borderDark: 'rgb(51, 51, 51)',
  separator: 'rgb(203, 213, 225)',

  brand: 'rgb(0, 122, 255)',
  brandAlt: 'rgb(88, 86, 214)',
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(245, 158, 11)',
  danger: 'rgb(239, 68, 68)',

  shadow: 'black',

  // Feature-specific accents
  aiSurface: 'rgb(42, 26, 58)',
  automationSurface: 'rgb(26, 58, 42)',
  mutedOnDark: 'rgb(203, 213, 225)',
  standardSurface: 'rgb(232, 244, 248)',
  enterpriseSurface: 'rgb(240, 232, 248)',
};
