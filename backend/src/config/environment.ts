/**
 * Backend Environment Configuration and Validation
 * Validates required environment variables and provides type-safe access
 */

interface BackendEnvironmentConfig {
  server: {
    nodeEnv: string;
    port: number;
    logLevel: string;
    frontendUrl: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3BucketName: string;
    s3BucketRegion: string;
  };
  parsing: {
    browserTimeout: number;
    maxConcurrentParsers: number;
    cacheTtl: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  image?: {
    maxSize: number;
    supportedFormats: string[];
    quality: number;
  };
}

/**
 * Validates and returns backend environment configuration
 * Throws error if required variables are missing
 */
function validateBackendEnvironment(): BackendEnvironmentConfig {
  const requiredVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };

  // Check for missing required variables
  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.\n' +
      'Copy backend/.env.example to backend/.env and fill in your values.'
    );
  }

  // Validate Supabase URL format
  if (!requiredVars.SUPABASE_URL!.startsWith('https://') || 
      !requiredVars.SUPABASE_URL!.includes('.supabase.co')) {
    throw new Error('SUPABASE_URL must be a valid Supabase URL');
  }

  // Validate OpenAI API key format
  if (!requiredVars.OPENAI_API_KEY!.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY must be a valid OpenAI API key (starts with sk-)');
  }

  // Validate port
  const port = parseInt(requiredVars.PORT!, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535');
  }

  return {
    server: {
      nodeEnv: requiredVars.NODE_ENV!,
      port,
      logLevel: process.env.LOG_LEVEL || 'INFO',
      frontendUrl: requiredVars.FRONTEND_URL!,
    },
    supabase: {
      url: requiredVars.SUPABASE_URL!,
      anonKey: requiredVars.SUPABASE_ANON_KEY!,
      serviceRoleKey: requiredVars.SUPABASE_SERVICE_ROLE_KEY!,
    },
    openai: {
      apiKey: requiredVars.OPENAI_API_KEY!,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    },
    aws: process.env.AWS_ACCESS_KEY_ID ? {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      s3BucketName: process.env.S3_BUCKET_NAME || 'mealmate-images',
      s3BucketRegion: process.env.S3_BUCKET_REGION || 'us-east-1',
    } : undefined,
    parsing: {
      browserTimeout: parseInt(process.env.BROWSER_TIMEOUT || '30000', 10),
      maxConcurrentParsers: parseInt(process.env.MAX_CONCURRENT_PARSERS || '3', 10),
      cacheTtl: parseInt(process.env.PARSING_CACHE_TTL || '3600', 10),
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    image: process.env.MAX_IMAGE_SIZE ? {
      maxSize: parseInt(process.env.MAX_IMAGE_SIZE, 10),
      supportedFormats: (process.env.SUPPORTED_IMAGE_FORMATS || 'jpeg,jpg,png,webp').split(','),
      quality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
    } : undefined,
  };
}

// Validate environment on module load
export const env = validateBackendEnvironment();

// Export individual configs for convenience
export const serverConfig = env.server;
export const supabaseConfig = env.supabase;
export const openaiConfig = env.openai;
export const awsConfig = env.aws;
export const parsingConfig = env.parsing;
export const rateLimitConfig = env.rateLimit;
export const imageConfig = env.image;

// Environment helpers
export const isDevelopment = env.server.nodeEnv === 'development';
export const isProduction = env.server.nodeEnv === 'production';
export const isStaging = env.server.nodeEnv === 'staging';

// Logging helper
export function logEnvironmentInfo() {
  if (isDevelopment) {
    console.log('🔧 Backend Environment Configuration:', {
      nodeEnv: env.server.nodeEnv,
      port: env.server.port,
      supabaseUrl: env.supabase.url,
      openaiModel: env.openai.model,
      awsConfigured: !!env.aws,
      imageProcessing: !!env.image,
    });
  }
}

// Validation helper for startup
export function validateEnvironmentOnStartup(): void {
  try {
    validateBackendEnvironment();
    console.log('✅ Environment validation passed');
    if (isDevelopment) {
      logEnvironmentInfo();
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
