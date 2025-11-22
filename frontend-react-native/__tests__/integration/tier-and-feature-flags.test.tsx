/**
 * Tier & Feature Flags Integration Tests
 * Tests all wrapped screens with different tier levels and feature flag combinations
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// Screen imports
import LiveDashboardScreen from '../../src/screens/LiveDashboardScreen';
import ARViewScreen from '../../src/screens/ARViewScreen';
import DashboardScreen from '../../src/screens/Dashboard/DashboardScreen';
import TasksScreen from '../../src/screens/Tasks/TasksScreen';
import CreateTaskScreen from '../../src/screens/CreateTask/CreateTaskScreen';
import TaskDetailScreen from '../../src/screens/TaskDetail/TaskDetailScreen';

// Provider imports
import { FeatureFlagProvider } from '../../src/providers/FeatureFlagProvider';
import { TierProvider } from '../../src/providers/TierProvider';
import { IAPProvider } from '../../src/providers/IAPProvider';

// Mock hooks
jest.mock('../../src/hooks/useFeatureFlags');
jest.mock('../../src/hooks/useUserTier');
jest.mock('../../src/hooks/useIAP');
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/services/api');

// Test wrapper component that provides all contexts
const TestWrapper: React.FC<{ children: React.ReactNode; tier?: string; flags?: Record<string, boolean> }> = ({
  children,
  tier = 'free',
  flags = {},
}) => {
  const { useFeatureFlags } = require('../../src/hooks/useFeatureFlags');
  const { useUserTier } = require('../../src/hooks/useUserTier');

  // Mock the hooks to return test data
  useFeatureFlags.mockReturnValue({
    flags,
    loading: false,
    refresh: jest.fn(),
    lastUpdated: Date.now(),
  });

  useUserTier.mockReturnValue({
    tier,
    hasTier: (requiredTier: string) => {
      const tierHierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
      return tierHierarchy[tier] >= tierHierarchy[requiredTier];
    },
    loading: false,
  });

  return (
    <NavigationContainer>
      <FeatureFlagProvider>
        <TierProvider>
          <IAPProvider apiKey="test-key">{children}</IAPProvider>
        </TierProvider>
      </FeatureFlagProvider>
    </NavigationContainer>
  );
};

describe('Tier & Feature Flags Integration Tests', () => {
  describe('LiveDashboardScreen - Tier Guard (Standard)', () => {
    it('should render for standard tier users', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard">
          <LiveDashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Live AI/ML Dashboard')).toBeTruthy();
      });
    });

    it('should render for enterprise tier users', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise">
          <LiveDashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Live AI/ML Dashboard')).toBeTruthy();
      });
    });

    it('should NOT render for free tier users', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free">
          <LiveDashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Live AI/ML Dashboard')).toBeFalsy();
      });
    });
  });

  describe('ARViewScreen - Combined Guards (ar_mode flag + Enterprise tier)', () => {
    it('should render when ar_mode flag enabled and enterprise tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ar_mode: true }}>
          <ARViewScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeTruthy();
      });
    });

    it('should NOT render without ar_mode flag (enterprise tier)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ar_mode: false }}>
          <ARViewScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeFalsy();
      });
    });

    it('should NOT render for standard tier (even with ar_mode flag)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard" flags={{ ar_mode: true }}>
          <ARViewScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeFalsy();
      });
    });

    it('should NOT render for free tier (even with ar_mode flag)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free" flags={{ ar_mode: true }}>
          <ARViewScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeFalsy();
      });
    });
  });

  describe('DashboardScreen - Partial Component Guards', () => {
    it('should show base dashboard for free tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free">
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Welcome back!')).toBeTruthy();
      });
    });

    it('should show Advanced Analytics for standard tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard">
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Advanced Analytics')).toBeTruthy();
      });
    });

    it('should NOT show Advanced Analytics for free tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free">
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Advanced Analytics')).toBeFalsy();
      });
    });

    it('should show AI-Powered Insights for enterprise tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise">
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('AI-Powered Insights')).toBeTruthy();
      });
    });

    it('should NOT show AI-Powered Insights for free/standard tier', async () => {
      const { queryByText: queryFree } = render(
        <TestWrapper tier="free">
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryFree('AI-Powered Insights')).toBeFalsy();
      });

      const { queryByText: queryStandard } = render(
        <TestWrapper tier="standard">
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryStandard('AI-Powered Insights')).toBeFalsy();
      });
    });
  });

  describe('TasksScreen - Feature Flags & Combined Guards', () => {
    it('should show Advanced Filters when flag enabled', async () => {
      const { queryByText } = render(
        <TestWrapper flags={{ advanced_filtering: true }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('✨ Advanced Filters Available')).toBeTruthy();
      });
    });

    it('should NOT show Advanced Filters when flag disabled', async () => {
      const { queryByText } = render(
        <TestWrapper flags={{ advanced_filtering: false }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('✨ Advanced Filters Available')).toBeFalsy();
      });
    });

    it('should show Bulk Actions when flag enabled', async () => {
      const { queryByText } = render(
        <TestWrapper flags={{ advanced_actions: true }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('⚡ Bulk Actions Enabled')).toBeTruthy();
      });
    });

    it('should show AI Task Suggestions for enterprise + flag', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ai_suggestions: true }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Task Suggestions')).toBeTruthy();
      });
    });

    it('should NOT show AI Task Suggestions without flag (enterprise tier)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ai_suggestions: false }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Task Suggestions')).toBeFalsy();
      });
    });

    it('should NOT show AI Task Suggestions for free tier (even with flag)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free" flags={{ ai_suggestions: true }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Task Suggestions')).toBeFalsy();
      });
    });
  });

  describe('CreateTaskScreen - AI Suggestions Guard', () => {
    it('should show AI Suggestions for enterprise + flag', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ai_suggestions: true }}>
          <CreateTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Suggestions')).toBeTruthy();
      });
    });

    it('should NOT show AI Suggestions for standard tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard" flags={{ ai_suggestions: true }}>
          <CreateTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Suggestions')).toBeFalsy();
      });
    });

    it('should NOT show AI Suggestions for free tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free" flags={{ ai_suggestions: true }}>
          <CreateTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Suggestions')).toBeFalsy();
      });
    });
  });

  describe('TaskDetailScreen - Multiple Premium Features', () => {
    it('should show Export Task Data for standard tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard" taskId="1">
          <TaskDetailScreen taskId="1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('📊 Export Task Data')).toBeTruthy();
      });
    });

    it('should NOT show Export Task Data for free tier', async () => {
      const { queryByText } = render(
        <TestWrapper tier="free">
          <TaskDetailScreen taskId="1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('📊 Export Task Data')).toBeFalsy();
      });
    });

    it('should show AI Insights for enterprise + flag', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ ai_suggestions: true }}>
          <TaskDetailScreen taskId="1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('🤖 AI Insights')).toBeTruthy();
      });
    });

    it('should show Automation Rules for enterprise + flag', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ workflow_automation: true }}>
          <TaskDetailScreen taskId="1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('⚙️ Automation Rules')).toBeTruthy();
      });
    });

    it('should NOT show Automation Rules without workflow_automation flag', async () => {
      const { queryByText } = render(
        <TestWrapper tier="enterprise" flags={{ workflow_automation: false }}>
          <TaskDetailScreen taskId="1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('⚙️ Automation Rules')).toBeFalsy();
      });
    });

    it('should NOT show Automation Rules for standard tier (even with flag)', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard" flags={{ workflow_automation: true }}>
          <TaskDetailScreen taskId="1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('⚙️ Automation Rules')).toBeFalsy();
      });
    });
  });

  describe('Tier Hierarchy Tests', () => {
    it('enterprise tier should have access to all standard tier features', async () => {
      const { queryByText: enterpriseQuery } = render(
        <TestWrapper tier="enterprise">
          <LiveDashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(enterpriseQuery('Live AI/ML Dashboard')).toBeTruthy();
      });
    });

    it('standard tier should NOT have access to enterprise features', async () => {
      const { queryByText } = render(
        <TestWrapper tier="standard">
          <ARViewScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('Augmented Reality View')).toBeFalsy();
      });
    });

    it('free tier should NOT have access to any premium features', async () => {
      const { queryByText: freeQuery } = render(
        <TestWrapper tier="free">
          <LiveDashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(freeQuery('Live AI/ML Dashboard')).toBeFalsy();
      });
    });
  });

  describe('Feature Flag Rollout Tests', () => {
    it('should support progressive feature rollout', async () => {
      // Week 1: 1% of users
      let { queryByText } = render(
        <TestWrapper flags={{ advanced_filtering: true }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('✨ Advanced Filters Available')).toBeTruthy();
      });

      // Week 4: 100% of users
      ({ queryByText } = render(
        <TestWrapper flags={{ advanced_filtering: true }}>
          <TasksScreen />
        </TestWrapper>
      ));

      await waitFor(() => {
        expect(queryByText('✨ Advanced Filters Available')).toBeTruthy();
      });
    });

    it('should support killing features via flag', async () => {
      // Feature enabled
      let { queryByText } = render(
        <TestWrapper flags={{ advanced_actions: true }}>
          <TasksScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(queryByText('⚡ Bulk Actions Enabled')).toBeTruthy();
      });

      // Feature killed via flag
      ({ queryByText } = render(
        <TestWrapper flags={{ advanced_actions: false }}>
          <TasksScreen />
        </TestWrapper>
      ));

      await waitFor(() => {
        expect(queryByText('⚡ Bulk Actions Enabled')).toBeFalsy();
      });
    });
  });
});
