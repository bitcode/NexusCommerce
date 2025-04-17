/**
 * ErrorHandlingUtils.ts
 * Utilities for error handling, retry mechanisms, and user-friendly error messages.
 */

import { NotificationSystem, NotificationType, NotificationTopic } from './NotificationSystem';

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

/**
 * Extended error interface with additional properties
 */
export interface ExtendedError extends Error {
  category?: ErrorCategory;
  statusCode?: number;
  retryable?: boolean;
  originalError?: any;
  context?: any;
}

/**
 * Options for retry mechanism
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableCategories?: ErrorCategory[];
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  retryableCategories: [
    ErrorCategory.NETWORK,
    ErrorCategory.RATE_LIMIT,
    ErrorCategory.SERVER
  ]
};

/**
 * Categorizes an error based on its properties
 * 
 * @param error - The error to categorize
 * @returns The error category
 */
export function categorizeError(error: any): ErrorCategory {
  // If it's already categorized, return the category
  if ((error as ExtendedError).category) {
    return (error as ExtendedError).category!;
  }
  
  // Check for network errors
  if (
    error.message?.includes('network') ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT'
  ) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for authentication errors
  if (
    error.statusCode === 401 ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('authentication') ||
    error.message?.includes('invalid token')
  ) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // Check for authorization errors
  if (
    error.statusCode === 403 ||
    error.message?.includes('forbidden') ||
    error.message?.includes('permission')
  ) {
    return ErrorCategory.AUTHORIZATION;
  }
  
  // Check for validation errors
  if (
    error.statusCode === 400 ||
    error.message?.includes('validation') ||
    error.message?.includes('invalid') ||
    error.message?.includes('required field')
  ) {
    return ErrorCategory.VALIDATION;
  }
  
  // Check for rate limit errors
  if (
    error.statusCode === 429 ||
    error.message?.includes('rate limit') ||
    error.message?.includes('too many requests') ||
    error.message?.includes('throttled')
  ) {
    return ErrorCategory.RATE_LIMIT;
  }
  
  // Check for server errors
  if (
    (error.statusCode && error.statusCode >= 500 && error.statusCode < 600) ||
    error.message?.includes('server error') ||
    error.message?.includes('internal error')
  ) {
    return ErrorCategory.SERVER;
  }
  
  // Check for client errors
  if (
    (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) ||
    error.message?.includes('client error')
  ) {
    return ErrorCategory.CLIENT;
  }
  
  // Default to unknown
  return ErrorCategory.UNKNOWN;
}

/**
 * Creates a user-friendly error message based on the error category
 * 
 * @param error - The error to create a message for
 * @returns User-friendly error message
 */
export function createUserFriendlyErrorMessage(error: any): string {
  const category = categorizeError(error);
  
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Network error: Please check your internet connection and try again.';
      
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication error: Your session may have expired. Please log in again.';
      
    case ErrorCategory.AUTHORIZATION:
      return 'Authorization error: You do not have permission to perform this action.';
      
    case ErrorCategory.VALIDATION:
      return `Validation error: ${error.message || 'Please check your input and try again.'}`;
      
    case ErrorCategory.RATE_LIMIT:
      return 'Rate limit exceeded: Too many requests. Please try again later.';
      
    case ErrorCategory.SERVER:
      return 'Server error: The server encountered an error. Please try again later.';
      
    case ErrorCategory.CLIENT:
      return `Client error: ${error.message || 'An error occurred in the application.'}`;
      
    case ErrorCategory.UNKNOWN:
    default:
      return `An unexpected error occurred: ${error.message || 'Please try again or contact support.'}`;
  }
}

/**
 * Determines if an error is retryable based on its category
 * 
 * @param error - The error to check
 * @param options - Retry options
 * @returns Whether the error is retryable
 */
export function isRetryableError(error: any, options: RetryOptions = DEFAULT_RETRY_OPTIONS): boolean {
  // If the error explicitly defines retryable, use that
  if ((error as ExtendedError).retryable !== undefined) {
    return (error as ExtendedError).retryable!;
  }
  
  const category = categorizeError(error);
  return options.retryableCategories?.includes(category) || false;
}

/**
 * Calculates the delay for the next retry attempt
 * 
 * @param attempt - Current attempt number (0-based)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(attempt: number, options: RetryOptions = DEFAULT_RETRY_OPTIONS): number {
  const delay = options.initialDelay * Math.pow(options.backoffFactor, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Executes a function with retry logic
 * 
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Promise resolving to the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error, options) || attempt >= options.maxRetries - 1) {
        throw error;
      }
      
      const delay = calculateRetryDelay(attempt, options);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Handles an error with notifications and logging
 * 
 * @param error - The error to handle
 * @param notificationSystem - NotificationSystem instance
 * @param context - Additional context for the error
 * @returns User-friendly error message
 */
export function handleError(
  error: any,
  notificationSystem: NotificationSystem,
  context?: any
): string {
  // Categorize the error
  const category = categorizeError(error);
  
  // Create a user-friendly message
  const userMessage = createUserFriendlyErrorMessage(error);
  
  // Determine notification type based on category
  let notificationType = NotificationType.ERROR;
  if (category === ErrorCategory.VALIDATION) {
    notificationType = NotificationType.WARNING;
  }
  
  // Determine notification topic based on category
  let notificationTopic = NotificationTopic.SYSTEM;
  if (category === ErrorCategory.RATE_LIMIT) {
    notificationTopic = NotificationTopic.RATE_LIMIT_EXCEEDED;
  } else if (category === ErrorCategory.AUTHENTICATION || category === ErrorCategory.AUTHORIZATION) {
    notificationTopic = NotificationTopic.API_ERROR;
  }
  
  // Create extended error with additional properties
  const extendedError: ExtendedError = error instanceof Error ? error : new Error(error.message || String(error));
  extendedError.category = category;
  extendedError.context = context;
  
  // Log the error
  console.error('Error:', {
    message: extendedError.message,
    category,
    context,
    stack: extendedError.stack
  });
  
  // Send notification
  notificationSystem.notify(
    userMessage,
    notificationType,
    notificationTopic,
    {
      error: {
        message: extendedError.message,
        category,
        context
      }
    }
  );
  
  return userMessage;
}