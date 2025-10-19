export default {
  projects: [
    '<rootDir>/packages/core',
    '<rootDir>/packages/design-system',
    '<rootDir>/apps/native',
    '<rootDir>/apps/wearable',
    '<rootDir>/apps/tablet',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
