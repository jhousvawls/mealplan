export interface RecipeImage {
  url: string;
  type: 'hero' | 'step' | 'ingredient' | 'gallery';
  alt_text?: string;
  dimensions?: { width: number; height: number };
  quality_score?: number;
}

export interface ParsedRecipe {
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  prep_time?: string;
  cook_time?: string;
  total_time?: string;
  servings?: number;
  cuisine?: string;
  category?: string;
  difficulty?: string;
  nutrition?: NutritionInfo;
  available_images: RecipeImage[];
  source_url: string;
  author?: string;
  description?: string;
  keywords?: string[];
}

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  servings?: number;
}

export interface ParseRequest {
  url: string;
  options?: {
    includeImages?: boolean;
    maxImages?: number;
    preferredImageTypes?: RecipeImage['type'][];
  };
}

export interface ParseResponse {
  success: boolean;
  data?: ParsedRecipe;
  error?: string;
  message?: string;
}

export interface ParseTextRequest {
  text: string;
  context?: 'social_media' | 'general';
  sourceUrl?: string;
}

export interface ParseTextResponse {
  success: boolean;
  data?: ParsedRecipe;
  error?: string;
  message?: string;
  confidence?: number;
}

export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  optimize?: boolean;
}

export interface ProcessedImage {
  url: string;
  originalUrl: string;
  size: number;
  dimensions: { width: number; height: number };
  format: string;
  s3Key?: string;
}

export interface ScrapingResult {
  recipe?: ParsedRecipe;
  images: RecipeImage[];
  metadata: {
    title?: string;
    description?: string;
    siteName?: string;
    favicon?: string;
  };
  success: boolean;
  error?: string;
}

export interface SiteConfig {
  name: string;
  domains: string[];
  selectors: {
    title?: string;
    ingredients?: string;
    instructions?: string;
    prepTime?: string;
    cookTime?: string;
    servings?: string;
    images?: string;
    nutrition?: {
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
    };
  };
  jsonLd?: boolean;
  microdata?: boolean;
}

// Enhanced Error Handling Types
export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication Errors (401)
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization Errors (403)
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Not Found Errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RECIPE_NOT_FOUND = 'RECIPE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  MEAL_PLAN_NOT_FOUND = 'MEAL_PLAN_NOT_FOUND',
  
  // Conflict Errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // External API Errors (502, 503)
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  RECIPE_PARSING_ERROR = 'RECIPE_PARSING_ERROR',
  
  // Internal Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR'
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  // Static factory methods for common errors
  static validation(message: string, details?: any): AppError {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, true, details);
  }

  static authentication(message: string = 'Authentication required'): AppError {
    return new AppError(message, ErrorCode.AUTHENTICATION_ERROR, 401);
  }

  static authorization(message: string = 'Insufficient permissions'): AppError {
    return new AppError(message, ErrorCode.AUTHORIZATION_ERROR, 403);
  }

  static notFound(resource: string = 'Resource'): AppError {
    return new AppError(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, ErrorCode.CONFLICT, 409);
  }

  static rateLimit(message: string = 'Too many requests'): AppError {
    return new AppError(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429);
  }

  static externalApi(service: string, originalError?: any): AppError {
    return new AppError(
      `External API error: ${service}`,
      ErrorCode.EXTERNAL_API_ERROR,
      502,
      true,
      originalError
    );
  }

  static internal(message: string = 'Internal server error', details?: any): AppError {
    return new AppError(message, ErrorCode.INTERNAL_SERVER_ERROR, 500, false, details);
  }
}

// Legacy interface for backward compatibility
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

// Standardized API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
    stack?: string; // Only in development
  };
  meta: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    storage: 'connected' | 'disconnected';
    puppeteer: 'ready' | 'not_ready';
  };
}
