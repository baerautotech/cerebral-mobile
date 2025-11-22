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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

// Import screens
import ARViewScreen from '../screens/ARViewScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import CreateTaskScreen from '../screens/CreateTask';
import DashboardScreen from '../screens/Dashboard';
import LiveDashboardScreen from '../screens/LiveDashboardScreen';
import TaskDetailScreen from '../screens/TaskDetail';
import TasksScreen from '../screens/Tasks';
import { AuthService } from '../services/supabase';

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

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  CreateTask: undefined;
  TaskDetail: { taskId: string };
  ARView: undefined;
  LiveDashboard: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

/**
 * Authentication Stack
 */
const AuthNavigator = (): void => {
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
 * Main App Tabs (after authentication)
 */
const MainNavigator = (): void => {
  const isWeb = Platform.OS === 'web';

  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <MainTabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: DashboardIcon,
        }}
      />

      <MainTabs.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: 'Tasks',
          tabBarIcon: TasksIcon,
        }}
      />

      {/* Modal/Detail screens - hidden from tabs */}
      <MainTabs.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Create Task',
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      <MainTabs.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          title: 'Task Details',
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      {!isWeb && (
        <>
          <MainTabs.Screen
            name="ARView"
            component={ARViewScreen}
            options={{
              title: 'AR View',
              tabBarIcon: ARViewIcon,
            }}
          />

          <MainTabs.Screen
            name="LiveDashboard"
            component={LiveDashboardScreen}
            options={{
              title: 'Live',
              tabBarIcon: LiveDashboardIcon,
            }}
          />
        </>
      )}
    </MainTabs.Navigator>
  );
};

/**
 * Root Navigator with Authentication Flow
 */
export const RootNavigator = (): void => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const { data: authListener } = AuthService.onAuthStateChange((event, session) => {
      setIsAuthenticated(session !== null);
    });

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

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});

// Stable tab icon components (defined outside render)
const DashboardIcon = (): React.JSX.Element => <Text style={styles.tabIcon}>📊</Text>;
const TasksIcon = (): React.JSX.Element => <Text style={styles.tabIcon}>📝</Text>;
const ARViewIcon = (): React.JSX.Element => <Text style={styles.tabIcon}>🥽</Text>;
const LiveDashboardIcon = (): React.JSX.Element => <Text style={styles.tabIcon}>⚡</Text>;

export default RootNavigator;
