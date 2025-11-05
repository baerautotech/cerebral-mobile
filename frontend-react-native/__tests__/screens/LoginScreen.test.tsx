/**
 * LoginScreen Tests
 * Comprehensive test coverage for login functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { AuthService } from '../../src/services/supabase';

// Mock AuthService
jest.mock('../../src/services/supabase');

describe('LoginScreen', () => {
  const mockOnLoginSuccess = jest.fn();
  const mockOnNavigateToSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      const { getByPlaceholderText, getAllByText } = render(
        <LoginScreen
          onLoginSuccess={mockOnLoginSuccess}
          onNavigateToSignup={mockOnNavigateToSignup}
        />
      );

      expect(getAllByText('Sign In').length).toBeGreaterThan(0);
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should render footer links', () => {
      const { getByText } = render(<LoginScreen />);

      expect(getByText('Forgot password?')).toBeTruthy();
      expect(getByText("Don't have an account?")).toBeTruthy();
    });
  });

  describe('User Input', () => {
    it('should update email input', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const emailInput = getByPlaceholderText('Email');

      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(passwordInput, 'password123');
      expect(passwordInput.props.value).toBe('password123');
    });
  });

  describe('Form Validation', () => {
    it('should show error if email is empty', async () => {
      const { getAllByText, queryByText } = render(<LoginScreen />);
      const signInButton = getAllByText('Sign In')[1]; // Button, not header

      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(queryByText('Please enter email and password')).toBeTruthy();
      });
    });

    it('should show error if password is empty', async () => {
      const { getByPlaceholderText, getAllByText, queryByText } = render(<LoginScreen />);
      const emailInput = getByPlaceholderText('Email');
      const signInButton = getAllByText('Sign In')[1]; // Button, not header

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(queryByText('Please enter email and password')).toBeTruthy();
      });
    });
  });

  describe('Authentication', () => {
    it('should call AuthService.signIn on submit', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { access_token: 'token' },
        error: null,
      });

      const { getByPlaceholderText, getAllByText } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getAllByText('Sign In')[1]); // Button, not header

      await waitFor(() => {
        expect(AuthService.signIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
      });
    });

    it('should call onLoginSuccess on successful login', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { access_token: 'token' },
        error: null,
      });

      const { getByPlaceholderText, getAllByText } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getAllByText('Sign In')[1]);

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalled();
      });
    });

    it('should show error on failed login', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        user: null,
        session: null,
        error: { message: 'Invalid credentials' },
      });

      const { getByPlaceholderText, getAllByText, queryByText } = render(<LoginScreen />);

      fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpass');
      fireEvent.press(getAllByText('Sign In')[1]);

      await waitFor(() => {
        expect(queryByText('Invalid credentials')).toBeTruthy();
      });
    });

    it('should disable form during login', async () => {
      (AuthService.signIn as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(getAllByText('Sign In')[1]);

      await waitFor(() => {
        expect(emailInput.props.editable).toBe(false);
        expect(passwordInput.props.editable).toBe(false);
      });
    });
  });

  describe('Navigation', () => {
    it('should call onNavigateToSignup when signup link pressed', () => {
      const { getByText } = render(
        <LoginScreen onNavigateToSignup={mockOnNavigateToSignup} />
      );

      fireEvent.press(getByText('Sign Up'));
      expect(mockOnNavigateToSignup).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during login', async () => {
      (AuthService.signIn as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { getByPlaceholderText, getAllByText, UNSAFE_queryAllByType } = render(<LoginScreen />);

      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getAllByText('Sign In')[1]);

      await waitFor(() => {
        // ActivityIndicator should be visible
        const indicators = UNSAFE_queryAllByType('ActivityIndicator' as any);
        expect(indicators.length).toBeGreaterThan(0);
      });
    });
  });
});
