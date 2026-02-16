/**
 * Tier & Feature Flags Integration Tests (Dashboard)
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import DashboardScreen from '../../src/screens/Dashboard/DashboardScreen';
import { TestWrapper } from '../testUtils/TestWrapper';

describe('Tier & Feature Flags (Dashboard)', () => {
  it('shows base dashboard for free tier', async () => {
    const { queryByText } = render(
      <TestWrapper tier="free">
        <DashboardScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('Welcome back!')).toBeTruthy();
    });
  });

  it('shows Advanced Analytics for standard tier', async () => {
    const { queryByText } = render(
      <TestWrapper tier="standard">
        <DashboardScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('Advanced Analytics')).toBeTruthy();
    });
  });

  it('shows AI-Powered Insights for enterprise tier', async () => {
    const { queryByText } = render(
      <TestWrapper tier="enterprise">
        <DashboardScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('🤖 AI-Powered Insights')).toBeTruthy();
    });
  });
});
