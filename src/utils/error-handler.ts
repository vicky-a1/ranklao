/**
 * Production-ready error handling utilities
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: Record<string, unknown>;
  timestamp?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(message: string, code = 'UNKNOWN_ERROR', context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Logger utility that respects environment
 */
export const logger = {
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    const errorInfo: ErrorInfo = {
      message,
      context,
      timestamp: new Date().toISOString()
    };

    if (error instanceof Error) {
      errorInfo.message = `${message}: ${error.message}`;
      errorInfo.context = { ...context, stack: error.stack };
    }

    // In development, log to console
    if (import.meta.env.DEV) {
      console.error('[ERROR]', errorInfo);
    }

    // In production, you would send to error tracking service
    // Example: Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // TODO: Integrate with error tracking service
      // errorTrackingService.captureError(errorInfo);
    }
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    const warnInfo = {
      message,
      context,
      timestamp: new Date().toISOString()
    };

    if (import.meta.env.DEV) {
      console.warn('[WARN]', warnInfo);
    }
  },

  info: (message: string, context?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.log('[INFO]', message, context);
    }
  },

  debug: (message: string, context?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.debug('[DEBUG]', message, context);
    }
  }
};

/**
 * Error boundary helper for async operations
 */
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context?: Record<string, unknown>
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error, context);
    return null;
  }
};

/**
 * Safe error message extraction
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error: unknown, operation: string): AppError => {
  const message = getErrorMessage(error);
  
  if (message.includes('404') || message.includes('not found')) {
    return new AppError(`Resource not found during ${operation}`, 'RESOURCE_NOT_FOUND', { operation });
  }
  
  if (message.includes('permission') || message.includes('unauthorized')) {
    return new AppError(`Permission denied for ${operation}`, 'PERMISSION_DENIED', { operation });
  }
  
  if (message.includes('network') || message.includes('connection')) {
    return new AppError(`Network error during ${operation}`, 'NETWORK_ERROR', { operation });
  }
  
  return new AppError(`Database error during ${operation}`, 'DATABASE_ERROR', { operation, originalError: message });
};

/**
 * API error handler
 */
export const handleApiError = (error: unknown, endpoint: string): AppError => {
  const message = getErrorMessage(error);
  
  if (message.includes('401') || message.includes('unauthorized')) {
    return new AppError('Authentication required', 'AUTH_REQUIRED', { endpoint });
  }
  
  if (message.includes('403') || message.includes('forbidden')) {
    return new AppError('Access forbidden', 'ACCESS_FORBIDDEN', { endpoint });
  }
  
  if (message.includes('404')) {
    return new AppError('Resource not found', 'NOT_FOUND', { endpoint });
  }
  
  if (message.includes('500')) {
    return new AppError('Server error', 'SERVER_ERROR', { endpoint });
  }
  
  return new AppError(`API error at ${endpoint}`, 'API_ERROR', { endpoint, originalError: message });
};