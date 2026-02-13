import { Alert } from 'react-native';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxAttempts) {
        onRetry?.(attempt, error);

        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('timeout') ||
    error?.code === 'NETWORK_ERROR' ||
    error?.code === 'ECONNREFUSED'
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    error?.message?.includes('auth') ||
    error?.message?.includes('unauthorized') ||
    error?.code === 'PGRST301' // Supabase auth error
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet and try again.';
  }

  if (isAuthError(error)) {
    return 'Session expired. Please sign in again.';
  }

  // Supabase specific errors
  if (error?.code?.startsWith('PGRST')) {
    return 'Database error. Please try again.';
  }

  // PostgreSQL errors
  if (error?.code?.startsWith('23')) {
    return 'This action conflicts with existing data. Please try something else.';
  }

  // Validation errors
  if (error?.message?.includes('invalid') || error?.message?.includes('required')) {
    return error.message;
  }

  // Generic fallback
  return error?.message || 'Something went wrong. Please try again.';
}

/**
 * Show error alert to user
 */
export function showErrorAlert(error: any, title: string = 'Error') {
  const message = getUserFriendlyError(error);
  Alert.alert(title, message);
}

/**
 * Log error for debugging (in production, send to analytics)
 */
export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error?.message,
    code: error?.code,
    status: error?.status,
    stack: error?.stack,
  };

  console.error('Error logged:', errorInfo);

  // TODO: Send to analytics service (Sentry, LogRocket, etc.)
  // analytics.logError(errorInfo);
}

/**
 * Wrapper for async operations with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    errorTitle?: string;
    showAlert?: boolean;
    retry?: boolean;
    retryOptions?: RetryOptions;
    logContext?: string;
  } = {}
): Promise<T | null> {
  const {
    errorTitle = 'Error',
    showAlert = true,
    retry: shouldRetry = false,
    retryOptions = {},
    logContext,
  } = options;

  try {
    if (shouldRetry) {
      return await retry(fn, retryOptions);
    } else {
      return await fn();
    }
  } catch (error: any) {
    logError(error, logContext);

    if (showAlert) {
      showErrorAlert(error, errorTitle);
    }

    return null;
  }
}

/**
 * Create a safe version of a function that won't throw
 */
export function makeSafe<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  defaultValue: any = null
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error);
      return defaultValue;
    }
  }) as T;
}
