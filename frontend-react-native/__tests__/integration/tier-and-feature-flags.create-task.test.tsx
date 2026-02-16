/**
 * Tier & Feature Flags Integration Tests (Create Task)
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import CreateTaskScreen from '../../src/screens/CreateTask/CreateTaskScreen';
import { TestWrapper } from '../testUtils/TestWrapper';

describe('Tier & Feature Flags (CreateTask)', () => {
  it('shows AI Suggestions panel for enterprise tier with flag enabled', async () => {
    const { queryByText } = render(
      <TestWrapper tier="enterprise" flags={{ ai_suggestions: true }}>
        <CreateTaskScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('🤖 AI Suggestions')).toBeTruthy();
    });
  });

  it('does not show AI Suggestions for standard tier (even with flag)', async () => {
    const { queryByText } = render(
      <TestWrapper tier="standard" flags={{ ai_suggestions: true }}>
        <CreateTaskScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('🤖 AI Suggestions')).toBeFalsy();
    });
  });

  it('does not show AI Suggestions when flag disabled', async () => {
    const { queryByText } = render(
      <TestWrapper tier="enterprise" flags={{ ai_suggestions: false }}>
        <CreateTaskScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(queryByText('🤖 AI Suggestions')).toBeFalsy();
    });
  });
});
