/**
 * Performance Utilities
 * Helpers for measuring and optimizing performance
 */

import { logPerformance } from '../services/monitoring';

/**
 * Measure execution time of a function
 */
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  logPerformance({
    name,
    value: duration,
    unit: 'ms',
  });

  return result;
};

/**
 * Measure async function execution time
 */
export const measurePerformanceAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  logPerformance({
    name,
    value: duration,
    unit: 'ms',
  });

  return result;
};

/**
 * Debounce function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if component should update (for React.memo)
 */
export const shallowEqual = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): boolean => {
  if (obj1 === obj2) return true;

  if ((typeof obj1 !== 'object' || obj1 === null) ?? (typeof obj2 !== 'object' || obj2 === null)) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    // eslint-disable-next-line security/detect-object-injection
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

/**
 * Batch multiple state updates
 */
export const batchUpdates = <_T = void>(updates: Array<() => void>): void => {
  // In React 19, batching is automatic, but this provides explicit control
  updates.forEach((update) => update());
};

/**
 * Measure component render time
 */
export const measureRender = (componentName: string): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.time(`Render: ${componentName}`);

    // Use in useEffect cleanup
    return () => {
      // eslint-disable-next-line no-console
      console.timeEnd(`Render: ${componentName}`);
    };
  }
};
