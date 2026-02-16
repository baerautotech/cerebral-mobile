/**
 * Tier & Feature Flags Integration Tests (focused)
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import LiveDashboardScreen from '../../src/screens/LiveDashboardScreen';
import ARViewScreen from '../../src/screens/ARViewScreen';
import { TestWrapper } from '../testUtils/TestWrapper';

describe('Tier & Feature Flags (LiveDashboard + AR)', () => {
  describe('LiveDashboardScreen - Tier Guard (Standard)', () => {
    it('renders for standard tier users', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard">
          <LiveDashboardScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText('Live AI/ML Dashboard')).toBeTruthy();
      });
    });

    it('renders for enterprise tier users', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise">
          <LiveDashboardScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText('Live AI/ML Dashboard')).toBeTruthy();
      });
    });

    it('does not render for free tier users', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free">
          <LiveDashboardScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText('Live AI/ML Dashboard')).toBeFalsy();
      });
    });
  });

  describe('ARViewScreen - Combined Guards (ar_mode flag + Enterprise tier)', () => {
    it('renders when ar_mode flag enabled and enterprise tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ar_mode: true }}>
          <ARViewScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeTruthy();
      });
    });

    it('does not render without ar_mode flag (enterprise tier)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ar_mode: false }}>
          <ARViewScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeFalsy();
      });
    });

    it('does not render for standard tier (even with ar_mode flag)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard" flags={{ ar_mode: true }}>
          <ARViewScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeFalsy();
      });
    });
  });
});
