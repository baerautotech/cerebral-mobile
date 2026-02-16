/**
 * Tier & Feature Flags Integration Tests (Tasks)
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import TasksScreen from '../../src/screens/Tasks/TasksScreen';
import { TestWrapper } from '../testUtils/TestWrapper';

describe('Tier & Feature Flags (Tasks)', () => {
  it('renders base tasks screen for free tier', async () => {
    const { queryByText } = render(
      <TestWrapper tier="free">
        <TasksScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('Tasks')).toBeTruthy();
    });
  });

  it('shows AI Task Suggestions for enterprise tier with flag enabled', async () => {
    const { queryByText } = render(
      <TestWrapper tier="enterprise" flags={{ ai_suggestions: true }}>
        <TasksScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('🤖 AI Task Suggestions')).toBeTruthy();
    });
  });

  it('does not show AI Task Suggestions for standard tier (even with flag)', async () => {
    const { queryByText } = render(
      <TestWrapper tier="standard" flags={{ ai_suggestions: true }}>
        <TasksScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('🤖 AI Task Suggestions')).toBeFalsy();
    });
  });

  it('shows Advanced Filters when flag enabled', async () => {
    const { queryByText } = render(
      <TestWrapper tier="free" flags={{ advanced_filtering: true }}>
        <TasksScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('✨ Advanced Filters Available')).toBeTruthy();
    });
  });

  it('shows Bulk Actions when flag enabled', async () => {
    const { queryByText } = render(
      <TestWrapper tier="free" flags={{ advanced_actions: true }}>
        <TasksScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('⚡ Bulk Actions Enabled')).toBeTruthy();
    });
  });
});
