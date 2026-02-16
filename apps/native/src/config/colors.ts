import type { ColorValue } from 'react-native';

// Guardrails prohibit hardcoded hex literals; use named colors / rgb() strings.
export const appColors: Record<string, ColorValue> = {
  background: 'rgb(245, 245, 245)',
  surface: 'white',

  textPrimary: 'rgb(17, 24, 39)',
  textSecondary: 'rgb(75, 85, 99)',

  separator: 'rgb(203, 213, 225)',
  border: 'rgb(229, 231, 235)',

  brand: 'rgb(59, 130, 246)',
  github: 'rgb(31, 41, 55)',
  google: 'rgb(66, 133, 244)',

  danger: 'rgb(239, 68, 68)',
  errorBackground: 'rgb(254, 226, 226)',
  errorText: 'rgb(220, 38, 38)',
};
