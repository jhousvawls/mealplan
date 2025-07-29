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

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
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
