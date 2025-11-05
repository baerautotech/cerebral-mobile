/**
 * Monitoring Service
 * Centralized error logging and performance monitoring with Sentry
 *
 * ✅ Sentry Integration Complete
 */

import * as Sentry from '@sentry/react-native';

interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: unknown;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  context?: Record<string, unknown>;
}

class MonitoringService {
  private static instance: MonitoringService;
  private initialized = false;

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Initialize monitoring service with Sentry
   * Call this once at app startup
   */
  initialize(config: { dsn?: string; environment: string }): void {
    if (this.initialized) {
      return;
    }

    if (!config.dsn) {
      this.initialized = true;
      return;
    }

    this.initializeSentry(config);
    this.initialized = true;
  }

  private initializeSentry(config: { dsn: string; environment: string }): void {
    const sentryConfig = this.buildSentryConfig(config);
    Sentry.init(sentryConfig);
  }

  private buildSentryConfig(config: { dsn: string; environment: string }): Sentry.ReactNativeOptions {
    return {
      dsn: config.dsn,
      environment: config.environment,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      enableAutoPerformanceTracing: true,
      tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
      enableNativeCrashHandling: true,
      enableNdkScopeSync: true,
      attachStacktrace: true,
      maxBreadcrumbs: 100,
      beforeSend: (event: Sentry.Event) => {
        if (__DEV__ && !process.env.SENTRY_DEBUG) {
          return null;
        }
        return event;
      },
      integrations: [
        new Sentry.ReactNativeTracing({
          tracingOrigins: ['localhost', 'cerebral.baerautotech.com', /^\//],
          routingInstrumentation: Sentry.reactNavigationIntegration(),
        }),
      ],
    };
  }

  /**
   * Log an error with context
   */
  logError(error: Error, context?: ErrorContext): void {
    if (__DEV__) {

      console.error('Error:', error.message, context);

    }

    Sentry.captureException(error, {
      extra: context,
      level: 'error',
    });
  }

  /**
   * Log a performance metric
   */
  logPerformance(metric: PerformanceMetric): void {
    // Set custom measurement in Sentry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sentry.setMeasurement(metric.name, metric.value, metric.unit as any);

    if (metric.context) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Sentry.setContext('performance', metric.context as Record<string, any>);
    }
  }

  /**
   * Log API error specifically
   */
  logApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: Record<string, unknown>
  ): void {
    const apiError = new Error(`API Error: ${method} ${endpoint}`);

    this.logError(apiError, {
      type: 'api_error',
      endpoint,
      method,
      statusCode,
      errorMessage: error.message ?? String(error),
    });
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email?: string }): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  }

  /**
   * Clear user context (on logout)
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    Sentry.addBreadcrumb({
      message,
      category,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as Record<string, any>,
      level: 'info',
    });
  }

  /**
   * Capture message (for non-errors)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  /**
   * Set custom tag
   */
  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, unknown>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sentry.setContext(name, context as Record<string, any>);
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Export helper functions
export const logError = (error: Error, context?: ErrorContext): void => {
  monitoring.logError(error, context);
};

export const logPerformance = (metric: PerformanceMetric): void => {
  monitoring.logPerformance(metric);
};

export const logApiError = (
  endpoint: string,
  method: string,
  statusCode: number,
  error: Record<string, unknown>
): void => {
  monitoring.logApiError(endpoint, method, statusCode, error);
};

export const setUser = (user: { id: string; email?: string }): void => {
  monitoring.setUser(user);
};

export const clearUser = (): void => {
  monitoring.clearUser();
};

export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
): void => {
  monitoring.addBreadcrumb(message, category, data);
};

export const captureMessage = (
  message: string,
  level?: 'info' | 'warning' | 'error'
): void => {
  monitoring.captureMessage(message, level);
};

export default monitoring;
