/**
 * Authentication Flow Integration Tests
 * Tests complete auth flow from login to authenticated state
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '../../src/navigation/RootNavigator';
import { AuthService } from '../../src/services/supabase';

jest.mock('../../src/services/supabase');

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect unauthenticated user to login', async () => {
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    const { queryByText } = render(<RootNavigator />);

    await waitFor(() => {
      // Should show login screen
      expect(queryByText('Sign In')).toBeTruthy();
    });
  });

  it('should show dashboard for authenticated user', async () => {
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    (AuthService.getUser as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
    });
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    const { queryByText } = render(<RootNavigator />);

    await waitFor(() => {
      // Should show dashboard
      expect(queryByText('Welcome back!')).toBeTruthy();
    });
  });

  it('should navigate to dashboard after successful login', async () => {
    // Start unauthenticated
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    let authCallback: any;
    (AuthService.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const { getByPlaceholderText, getAllByText, queryByText } = render(<RootNavigator />);

    await waitFor(() => {
      expect(queryByText('Sign In')).toBeTruthy();
    });

    // Simulate login
    (AuthService.signIn as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      session: { access_token: 'token' },
      error: null,
    });

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getAllByText('Sign In')[1]);

    // Simulate auth state change
    authCallback('SIGNED_IN', { access_token: 'token' });

    await waitFor(() => {
      expect(queryByText('Welcome back!')).toBeTruthy();
    });
  });
});
