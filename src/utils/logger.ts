/**
 * Conditional Logging Utility
 * 
 * Provides logging functions that only log in development mode.
 * In production builds, all logs are disabled to prevent:
 * - Sensitive data exposure (tokens, user IDs, passwords)
 * - Performance overhead
 * - Console clutter
 * 
 * Usage:
 * ```typescript
 * import { log, error, warn, info } from '@/utils/logger';
 * 
 * log('User action performed');
 * error('Something went wrong', errorObject);
 * warn('Deprecated feature used');
 * info('Application initialized');
 * ```
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logs a message to the console (only in development)
 * 
 * @param message - The message to log
 * @param ...args - Additional arguments to log
 */
export function log(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.log(message, ...args);
  }
}

/**
 * Logs an error to the console (only in development)
 * 
 * @param message - The error message
 * @param error - Optional error object
 * @param ...args - Additional arguments to log
 */
export function error(message: string, error?: any, ...args: any[]): void {
  if (isDevelopment) {
    if (error) {
      console.error(message, error, ...args);
    } else {
      console.error(message, ...args);
    }
  }
}

/**
 * Logs a warning to the console (only in development)
 * 
 * @param message - The warning message
 * @param ...args - Additional arguments to log
 */
export function warn(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.warn(message, ...args);
  }
}

/**
 * Logs an info message to the console (only in development)
 * 
 * @param message - The info message
 * @param ...args - Additional arguments to log
 */
export function info(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.info(message, ...args);
  }
}

/**
 * Logs a debug message to the console (only in development)
 * 
 * @param message - The debug message
 * @param ...args - Additional arguments to log
 */
export function debug(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.debug(message, ...args);
  }
}

/**
 * Sanitizes data before logging to prevent sensitive information exposure
 * Removes or masks sensitive fields like tokens, passwords, user IDs, etc.
 * 
 * @param data - The data object to sanitize
 * @returns Sanitized data object safe for logging
 */
export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'access_token',
    'refresh_token',
    'jwt',
    'secret',
    'key',
    'api_key',
    'authorization',
    'auth',
    'session',
    'user_id',
    'id',
    'email',
  ];

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}
