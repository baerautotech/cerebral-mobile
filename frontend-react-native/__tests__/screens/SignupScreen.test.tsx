/**
 * SignupScreen Tests
 * Comprehensive test coverage for signup functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../../src/screens/SignupScreen';
import { AuthService } from '../../src/services/supabase';

jest.mock('../../src/services/supabase');

describe('SignupScreen', () => {
  const mockOnSignupSuccess = jest.fn();
  const mockOnNavigateToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render signup form correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <SignupScreen
          onSignupSuccess={mockOnSignupSuccess}
          onNavigateToLogin={mockOnNavigateToLogin}
        />
      );

      expect(getByText('Create Account')).toBeTruthy();
      expect(getByPlaceholderText('Full Name')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error if fields are empty', async () => {
      const { getByText, queryByText } = render(<SignupScreen />);
      const createButton = getByText('Create Account');

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(queryByText('Please fill in all fields')).toBeTruthy();
      });
    });

    it('should show error if passwords do not match', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'different123');
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(queryByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should show error if password is too short', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'short');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'short');
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(queryByText('Password must be at least 8 characters')).toBeTruthy();
      });
    });
  });

  describe('Signup Process', () => {
    it('should call AuthService.signUp with correct data', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { access_token: 'token' },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <SignupScreen onSignupSuccess={mockOnSignupSuccess} />
      );

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123');
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(AuthService.signUp).toHaveBeenCalledWith('test@example.com', 'Password123', {
          full_name: 'Test User',
        });
      });
    });

    it('should call onSignupSuccess after successful signup', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: null,
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <SignupScreen onSignupSuccess={mockOnSignupSuccess} />
      );

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123');
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(mockOnSignupSuccess).toHaveBeenCalled();
      });
    });

    it('should show error on failed signup', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        user: null,
        session: null,
        error: { message: 'Email already registered' },
      });

      const { getByPlaceholderText, getByText, queryByText } = render(<SignupScreen />);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123');
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(queryByText('Email already registered')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to login when sign in link pressed', () => {
      const { getByText } = render(<SignupScreen onNavigateToLogin={mockOnNavigateToLogin} />);

      fireEvent.press(getByText('Sign In'));
      expect(mockOnNavigateToLogin).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should disable form during signup', async () => {
      (AuthService.signUp as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { getByPlaceholderText, getByText } = render(<SignupScreen />);
      const nameInput = getByPlaceholderText('Full Name');

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123');
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(nameInput.props.editable).toBe(false);
      });
    });
  });
});
