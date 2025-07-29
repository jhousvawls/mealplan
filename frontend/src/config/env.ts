/**
 * Environment Configuration and Validation
 * Validates required environment variables and provides type-safe access
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    url: string;
  };
  app: {
    environment: string;
    logLevel: string;
  };
  features: {
    aiFeatures: boolean;
    sharing: boolean;
    walmartIntegration: boolean;
  };
  analytics?: {
    googleAnalyticsId?: string;
    mixpanelToken?: string;
  };
}

/**
 * Validates and returns environment configuration
 * Throws error if required variables are missing
 */
function validateEnvironment(): EnvironmentConfig {
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  };

  // Check for missing required variables
  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate Supabase URL format
  if (!requiredVars.VITE_SUPABASE_URL.startsWith('https://') || 
      !requiredVars.VITE_SUPABASE_URL.includes('.supabase.co')) {
    throw new Error('VITE_SUPABASE_URL must be a valid Supabase URL');
  }

  // Validate API URL format
  if (!requiredVars.VITE_API_URL.startsWith('http')) {
    throw new Error('VITE_API_URL must be a valid HTTP URL');
  }

  return {
    supabase: {
      url: requiredVars.VITE_SUPABASE_URL,
      anonKey: requiredVars.VITE_SUPABASE_ANON_KEY,
    },
    api: {
      url: requiredVars.VITE_API_URL,
    },
    app: {
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    },
    features: {
      aiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
      sharing: import.meta.env.VITE_ENABLE_SHARING === 'true',
      walmartIntegration: import.meta.env.VITE_ENABLE_WALMART_INTEGRATION === 'true',
    },
    analytics: {
      googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
      mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN,
    },
  };
}

// Validate environment on module load
export const env = validateEnvironment();

// Export individual configs for convenience
export const supabaseConfig = env.supabase;
export const apiConfig = env.api;
export const appConfig = env.app;
export const featureFlags = env.features;
export const analyticsConfig = env.analytics;

// Development helpers
export const isDevelopment = env.app.environment === 'development';
export const isProduction = env.app.environment === 'production';
export const isStaging = env.app.environment === 'staging';

// Logging helper
export function logEnvironmentInfo() {
  if (isDevelopment) {
    console.log('🔧 Environment Configuration:', {
      environment: env.app.environment,
      supabaseUrl: env.supabase.url,
      apiUrl: env.api.url,
      features: env.features,
    });
  }
}
