import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError, ErrorCode, type ApiError, type ErrorResponse } from '../types';

// Generate unique request ID for tracking
const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const errorHandler = (
  error: Error | AppError | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();
  
  // Determine if this is our custom AppError or a generic error
  const isAppError = error instanceof AppError;
  const isApiError = 'statusCode' in error && 'code' in error;
  
  // Extract error details
  let statusCode: number;
  let code: string;
  let message: string;
  let details: any;
  let isOperational: boolean;

  if (isAppError) {
    // Handle our custom AppError
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
    isOperational = error.isOperational;
  } else if (isApiError) {
    // Handle legacy ApiError
    statusCode = (error as ApiError).statusCode || 500;
    code = (error as ApiError).code || ErrorCode.INTERNAL_SERVER_ERROR;
    message = error.message;
    isOperational = true;
  } else {
    // Handle generic JavaScript errors
    statusCode = 500;
    code = ErrorCode.INTERNAL_SERVER_ERROR;
    message = error.message || 'An unexpected error occurred';
    isOperational = false;
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      code = ErrorCode.VALIDATION_ERROR;
      isOperational = true;
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      code = ErrorCode.AUTHENTICATION_ERROR;
      isOperational = true;
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
      code = ErrorCode.AUTHORIZATION_ERROR;
      isOperational = true;
    } else if (error.name === 'NotFoundError') {
      statusCode = 404;
      code = ErrorCode.NOT_FOUND;
      isOperational = true;
    } else if (error.name === 'TimeoutError') {
      statusCode = 408;
      code = ErrorCode.EXTERNAL_API_ERROR;
      isOperational = true;
    } else if (error.name === 'RateLimitError') {
      statusCode = 429;
      code = ErrorCode.RATE_LIMIT_EXCEEDED;
      isOperational = true;
    }
  }

  // Log the error with appropriate level
  const logLevel = isOperational && statusCode < 500 ? 'warn' : 'error';
  logger[logLevel]('Request error', {
    requestId,
    error: {
      name: error.name,
      message: error.message,
      code,
      statusCode,
      isOperational,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    },
    details
  });

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    if (!isOperational || statusCode >= 500) {
      message = 'Something went wrong. Please try again later.';
      details = undefined;
    }
  }

  // Create standardized error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp,
      path: req.path,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    meta: {
      timestamp,
      requestId,
      version: process.env.APP_VERSION || '1.0.0'
    }
  };

  res.status(statusCode).json(errorResponse);
};

// Enhanced async handler with better error context
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Add request context to error if it's an AppError without details
      if (error instanceof AppError && !error.details) {
        // Create a new AppError with additional context since details is readonly
        const enhancedError = new AppError(
          error.message,
          error.code,
          error.statusCode,
          error.isOperational,
          {
            method: req.method,
            path: req.path,
            timestamp: new Date().toISOString(),
            originalError: error.details
          }
        );
        next(enhancedError);
      } else {
        next(error);
      }
    });
  };
};

// Factory functions for creating common errors (backward compatibility)
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

// Enhanced factory functions using new AppError class
export const createAppError = {
  validation: (message: string, details?: any) => AppError.validation(message, details),
  authentication: (message?: string) => AppError.authentication(message),
  authorization: (message?: string) => AppError.authorization(message),
  notFound: (resource?: string) => AppError.notFound(resource),
  conflict: (message: string) => AppError.conflict(message),
  rateLimit: (message?: string) => AppError.rateLimit(message),
  externalApi: (service: string, originalError?: any) => AppError.externalApi(service, originalError),
  internal: (message?: string, details?: any) => AppError.internal(message, details)
};

// Middleware to handle 404 errors for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = AppError.notFound(`Route ${req.method} ${req.path}`);
  next(error);
};

// Middleware to handle uncaught exceptions
export const uncaughtExceptionHandler = (error: Error): void => {
  logger.error('Uncaught Exception', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    timestamp: new Date().toISOString()
  });
  
  // Graceful shutdown
  process.exit(1);
};

// Middleware to handle unhandled promise rejections
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.toString(),
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
  
  // Graceful shutdown
  process.exit(1);
};
