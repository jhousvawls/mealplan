import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { recipeParser } from '../services/recipeParser';
import { ParseRequest, ParseResponse, ParseTextRequest, ParseTextResponse } from '../types';
import validator from 'validator';
import { logger } from '../utils/logger';

const router = Router();

// Parse recipe from URL
router.post('/parse', asyncHandler(async (req: Request, res: Response) => {
  const { url, options }: ParseRequest = req.body;

  // Validate URL
  if (!url || !validator.isURL(url)) {
    throw createError('Invalid URL provided', 400, 'INVALID_URL');
  }

  logger.info(`Parsing recipe from URL: ${url}`);

  try {
    const result = await recipeParser.parseRecipe(url);

    if (!result.success) {
      throw createError(
        result.error || 'Failed to parse recipe from URL',
        422,
        'PARSING_FAILED'
      );
    }

    const response: ParseResponse = {
      success: true,
      data: result.recipe,
      message: 'Recipe parsed successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Recipe parsing error:', { url, error: (error as Error).message });
    
    if ((error as any).statusCode) {
      throw error;
    }

    throw createError(
      'Failed to parse recipe. The website might not be supported or the recipe format is not recognized.',
      422,
      'PARSING_ERROR'
    );
  }
}));

// Validate URL endpoint
router.post('/validate-url', asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    throw createError('URL is required', 400, 'URL_REQUIRED');
  }

  const isValid = validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });

  if (!isValid) {
    res.status(200).json({
      success: false,
      valid: false,
      message: 'Invalid URL format',
    });
    return;
  }

  // Check if domain is supported
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const supportedDomains = [
      'allrecipes.com',
      'foodnetwork.com',
      'bonappetit.com',
      'seriouseats.com',
      'tasty.co',
      'food.com',
      'epicurious.com',
      'delish.com',
      'eatingwell.com',
      'cookinglight.com',
    ];

    const isSupported = supportedDomains.some(supportedDomain => 
      domain.includes(supportedDomain)
    );

    res.status(200).json({
      success: true,
      valid: true,
      supported: isSupported,
      domain,
      message: isSupported 
        ? 'URL is supported for recipe parsing'
        : 'URL is valid but may have limited parsing support',
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      valid: false,
      message: 'Invalid URL format',
    });
  }
}));

// Get supported domains
router.get('/supported-domains', asyncHandler(async (req: Request, res: Response) => {
  const supportedSites = [
    {
      name: 'AllRecipes',
      domain: 'allrecipes.com',
      features: ['structured-data', 'images', 'nutrition'],
      quality: 'excellent',
    },
    {
      name: 'Food Network',
      domain: 'foodnetwork.com',
      features: ['structured-data', 'images', 'chef-info'],
      quality: 'excellent',
    },
    {
      name: 'Bon Appétit',
      domain: 'bonappetit.com',
      features: ['structured-data', 'images', 'editorial'],
      quality: 'excellent',
    },
    {
      name: 'Serious Eats',
      domain: 'seriouseats.com',
      features: ['structured-data', 'images', 'detailed-instructions'],
      quality: 'excellent',
    },
    {
      name: 'Tasty',
      domain: 'tasty.co',
      features: ['structured-data', 'video', 'images'],
      quality: 'good',
    },
    {
      name: 'Generic Recipe Sites',
      domain: 'various',
      features: ['basic-parsing', 'fallback-support'],
      quality: 'fair',
    },
  ];

  res.status(200).json({
    success: true,
    data: {
      supported_sites: supportedSites,
      total_sites: supportedSites.length,
      parsing_methods: [
        'JSON-LD structured data',
        'Microdata',
        'Site-specific selectors',
        'Generic fallback parsing',
      ],
    },
  });
}));

// Parse recipe from text (for social media content)
router.post('/parse-text', asyncHandler(async (req: Request, res: Response) => {
  const { text, context, sourceUrl }: ParseTextRequest = req.body;

  // Validate input
  if (!text || text.trim().length === 0) {
    throw createError('Recipe text is required', 400, 'TEXT_REQUIRED');
  }

  if (text.trim().length > 10000) {
    throw createError('Recipe text is too long (max 10,000 characters)', 400, 'TEXT_TOO_LONG');
  }

  logger.info(`Parsing recipe from text, context: ${context || 'general'}`);

  try {
    // Use OpenAI to extract recipe data from text
    const result = await recipeParser.parseRecipeFromText(text, context, sourceUrl);

    if (!result.success) {
      throw createError(
        result.error || 'Failed to parse recipe from text',
        422,
        'TEXT_PARSING_FAILED'
      );
    }

    const response: ParseTextResponse = {
      success: true,
      data: result.recipe,
      message: 'Recipe parsed successfully from text',
      confidence: result.confidence || 0.8,
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Recipe text parsing error:', { 
      textLength: text.length, 
      context, 
      error: (error as Error).message 
    });
    
    if ((error as any).statusCode) {
      throw error;
    }

    throw createError(
      'Failed to parse recipe from text. Please check the format and try again.',
      422,
      'TEXT_PARSING_ERROR'
    );
  }
}));

// Health check for recipe parsing service
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Test if we can initialize the browser
    await recipeParser.initializeBrowser();
    
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'recipe-parser',
        browser: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Recipe parser health check failed:', error);
    
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        service: 'recipe-parser',
        browser: 'failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}));

export { router as recipeRoutes };
