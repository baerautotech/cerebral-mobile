/**
 * Root Navigator
 * Unified navigation for React Native (mobile) and Web
 *
 * Features:
 * - Stack navigation
 * - Bottom tabs (mobile)
 * - Authentication flow
 * - Web URL routing
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';

import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import { AuthService } from '../services/supabase';
import { MainNavigator } from './MainNavigator';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication Stack
 */
const AuthNavigator = (): React.ReactElement => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

/**
 * Root Navigator with Authentication Flow
 */
export const RootNavigator = (): React.ReactElement => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const { data: authListener } = AuthService.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(session !== null);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async (): Promise<void> => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to check auth state:', error);
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Web linking configuration
  const linking = {
    prefixes: ['https://cerebral.baerautotech.com', 'cerebral://'],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Signup: 'signup',
          },
        },
        Main: {
          screens: {
            Dashboard: 'app/dashboard',
            Tasks: 'app/tasks',
            Notifications: 'app/notifications',
            Account: 'app/account',
            ARView: 'app/ar',
            LiveDashboard: 'app/live',
          },
        },
      },
    },
  };

  if (isLoading) {
    // Return loading screen while checking auth
    return null;
  }

  return (
    <NavigationContainer
      linking={Platform.OS === 'web' ? linking : undefined}
      fallback={<Text>Loading...</Text>}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
