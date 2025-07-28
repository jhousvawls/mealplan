import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { ParsedRecipe, RecipeImage, ScrapingResult, SiteConfig } from '../types';
import { userAgentRotator } from './userAgentRotator';
import { domainRateLimiter } from './requestRateLimiter';

// Add stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());

class RecipeParserService {
  private browser: Browser | null = null;
  private siteConfigs: SiteConfig[] = [];

  constructor() {
    this.initializeSiteConfigs();
  }

  private initializeSiteConfigs(): void {
    this.siteConfigs = [
      {
        name: 'AllRecipes',
        domains: ['allrecipes.com'],
        selectors: {
          title: 'h1.headline',
          ingredients: '.recipe-summary__item',
          instructions: '.instructions-section .paragraph',
          prepTime: '.recipe-summary__item[data-id="prep-time"]',
          cookTime: '.recipe-summary__item[data-id="cook-time"]',
          servings: '.recipe-summary__item[data-id="servings"]',
          images: '.recipe-summary__image img, .recipe-media img',
        },
        jsonLd: true,
        microdata: true,
      },
      {
        name: 'Food Network',
        domains: ['foodnetwork.com'],
        selectors: {
          title: 'h1.o-AssetTitle__a-HeadlineText',
          ingredients: '.o-RecipeIngredient__a-Ingredient',
          instructions: '.o-Method__m-Step',
          prepTime: '.o-RecipeInfo__a-Description[data-module="prep time"]',
          cookTime: '.o-RecipeInfo__a-Description[data-module="cook time"]',
          images: '.m-MediaBlock__a-Image img, .recipe-lead-image img',
        },
        jsonLd: true,
      },
      {
        name: 'Bon Appétit',
        domains: ['bonappetit.com'],
        selectors: {
          title: 'h1[data-testid="ContentHeaderHed"]',
          ingredients: '[data-testid="IngredientList"] li',
          instructions: '[data-testid="InstructionsWrapper"] li',
          prepTime: '[data-testid="prep-time"]',
          cookTime: '[data-testid="cook-time"]',
          images: '.recipe-header-image img, .content-image img',
        },
        jsonLd: true,
      },
      {
        name: 'Serious Eats',
        domains: ['seriouseats.com'],
        selectors: {
          title: 'h1.heading__title',
          ingredients: '.recipe-ingredient',
          instructions: '.recipe-procedure-text',
          prepTime: '.recipe-about__item[data-ingredient="prep time"]',
          cookTime: '.recipe-about__item[data-ingredient="cook time"]',
          images: '.recipe-header__image img, .recipe-image img',
        },
        jsonLd: true,
      },
      {
        name: 'Tasty',
        domains: ['tasty.co'],
        selectors: {
          title: 'h1.recipe-name',
          ingredients: '.recipe-ingredients li',
          instructions: '.recipe-instructions li',
          prepTime: '.recipe-time-container .prep-time',
          cookTime: '.recipe-time-container .cook-time',
          images: '.recipe-video-container img, .recipe-image img',
        },
        jsonLd: true,
      },
    ];
  }

  async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      logger.info('Initializing enhanced Puppeteer browser with stealth mode...');
      
      // Use puppeteer-extra with stealth plugin
      this.browser = await puppeteerExtra.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--disable-web-security',
          '--disable-features=site-per-process',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      
      logger.info('Enhanced Puppeteer browser initialized successfully');
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Puppeteer browser closed');
    }
  }

  async parseRecipe(url: string, maxRetries: number = 3): Promise<ScrapingResult> {
    return this.parseRecipeWithRetry(url, maxRetries);
  }

  /**
   * Enhanced parseRecipe with retry logic, rate limiting, and anti-detection
   */
  async parseRecipeWithRetry(url: string, maxRetries: number = 3): Promise<ScrapingResult> {
    let lastError: Error | null = null;
    const domain = new URL(url).hostname.replace('www.', '');
    const rateLimiter = domainRateLimiter.getLimiter(domain);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Apply rate limiting
        await rateLimiter.waitForNextRequest();
        
        logger.info(`Parse attempt ${attempt}/${maxRetries} for URL: ${url}`);
        
        const result = await this.parseRecipeAttempt(url, attempt);
        
        // Mark request as completed
        rateLimiter.completeRequest();
        
        if (result.success) {
          logger.info(`Successfully parsed recipe on attempt ${attempt}`, { url, recipeName: result.recipe?.name });
          return result;
        }
        
        lastError = new Error(result.error || 'Parsing failed');
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          logger.warn('Non-retryable error encountered, stopping retries', { url, error: lastError.message });
          break;
        }
        
        // Add exponential backoff delay between retries
        if (attempt < maxRetries) {
          const baseDelay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
          const jitterDelay = baseDelay + (Math.random() * 1000); // Add 0-1s jitter
          
          logger.info(`Waiting ${jitterDelay}ms before retry ${attempt + 1}`, { url });
          await new Promise(resolve => setTimeout(resolve, jitterDelay));
        }
        
      } catch (error) {
        rateLimiter.completeRequest();
        lastError = error as Error;
        
        logger.warn(`Parse attempt ${attempt}/${maxRetries} failed:`, { 
          url, 
          error: lastError.message,
          stack: lastError.stack?.substring(0, 200) 
        });
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }
      }
    }

    return {
      recipe: undefined,
      images: [],
      metadata: { title: '', description: '', siteName: '', favicon: '' },
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    };
  }

  /**
   * Single parsing attempt with enhanced anti-detection measures
   */
  private async parseRecipeAttempt(url: string, attempt: number): Promise<ScrapingResult> {
    await this.initializeBrowser();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();
    
    try {
      // Enhanced anti-detection setup
      await this.setupPageForStealth(page, attempt);
      
      logger.debug(`Navigating to URL: ${url} (attempt ${attempt})`);
      
      // Navigate with enhanced options
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 45000 // Increased timeout
      });

      // Simulate human behavior
      await this.simulateHumanBehavior(page);

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Try multiple parsing strategies
      let recipe = await this.parseWithFallbacks($, url);

      // Extract images
      const images = await this.extractImages($, page);

      // Get metadata
      const metadata = {
        title: $('title').text() || '',
        description: $('meta[name="description"]').attr('content') || '',
        siteName: $('meta[property="og:site_name"]').attr('content') || '',
        favicon: $('link[rel="icon"]').attr('href') || '',
      };

      if (recipe) {
        recipe.source_url = url;
        recipe.available_images = images;
      }

      return {
        recipe: recipe || undefined,
        images,
        metadata,
        success: !!recipe,
        error: recipe ? undefined : 'Could not parse recipe from this URL',
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Setup page with anti-detection measures
   */
  private async setupPageForStealth(page: Page, attempt: number): Promise<void> {
    // Rotate user agent
    const userAgent = userAgentRotator.getRandomUserAgent();
    await page.setUserAgent(userAgent);
    
    // Rotate viewport
    const viewport = userAgentRotator.getRandomViewport();
    await page.setViewport(viewport);
    
    // Remove webdriver property and other automation indicators
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
    
    // Set additional headers to appear more human
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    logger.debug('Page setup for stealth mode completed', { 
      attempt, 
      userAgent: userAgent.substring(0, 50) + '...',
      viewport 
    });
  }

  /**
   * Simulate human-like behavior on the page
   */
  private async simulateHumanBehavior(page: Page): Promise<void> {
    try {
      // Random scroll to simulate reading
      await page.evaluate(() => {
        const scrollAmount = Math.random() * 500 + 200; // 200-700px
        window.scrollTo(0, scrollAmount);
      });
      
      // Random wait time (1-3 seconds)
      const waitTime = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      // Small additional wait
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      logger.debug('Human behavior simulation failed:', (error as Error).message);
    }
  }

  /**
   * Try multiple parsing strategies in order
   */
  private async parseWithFallbacks($: cheerio.CheerioAPI, url: string): Promise<ParsedRecipe | null> {
    // Strategy 1: Structured data
    try {
      const result = await this.parseStructuredData($);
      if (result && result.name && result.ingredients.length > 0) {
        logger.debug('Parsing successful with structured data', { 
          recipeName: result.name,
          ingredientCount: result.ingredients.length 
        });
        return result;
      }
    } catch (error) {
      logger.debug('Structured data parsing failed:', (error as Error).message);
    }

    // Strategy 2: Site-specific config
    const siteConfig = this.getSiteConfig(url);
    if (siteConfig) {
      try {
        const result = await this.parseBySiteConfig($, siteConfig);
        if (result && result.name && result.ingredients.length > 0) {
          logger.debug('Parsing successful with site config', { 
            recipeName: result.name,
            ingredientCount: result.ingredients.length 
          });
          return result;
        }
      } catch (error) {
        logger.debug('Site config parsing failed:', (error as Error).message);
      }
    }

    // Strategy 3: Generic parsing
    try {
      const result = await this.parseGeneric($);
      if (result && result.name && result.ingredients.length > 0) {
        logger.debug('Parsing successful with generic parser', { 
          recipeName: result.name,
          ingredientCount: result.ingredients.length 
        });
        return result;
      }
    } catch (error) {
      logger.debug('Generic parsing failed:', (error as Error).message);
    }
    
    return null;
  }

  /**
   * Get site configuration for URL
   */
  private getSiteConfig(url: string): SiteConfig | null {
    const domain = new URL(url).hostname.replace('www.', '');
    return this.siteConfigs.find(config => 
      config.domains.some(d => domain.includes(d))
    ) || null;
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'Invalid URL',
      'net::ERR_NAME_NOT_RESOLVED',
      'net::ERR_INTERNET_DISCONNECTED',
      'Navigation timeout',
      'Protocol error',
    ];
    
    return nonRetryableMessages.some(msg => 
      error.message.includes(msg)
    );
  }

  private async parseStructuredData($: cheerio.CheerioAPI): Promise<ParsedRecipe | null> {
    try {
      // Look for JSON-LD structured data
      const jsonLdScripts = $('script[type="application/ld+json"]');
      
      for (let i = 0; i < jsonLdScripts.length; i++) {
        const script = jsonLdScripts.eq(i);
        const jsonText = script.html();
        
        if (!jsonText) continue;
        
        try {
          const data = JSON.parse(jsonText);
          const recipes = Array.isArray(data) ? data : [data];
          
          for (const item of recipes) {
            if (item['@type'] === 'Recipe' || item.type === 'Recipe') {
              return this.parseJsonLdRecipe(item);
            }
          }
        } catch (parseError) {
          logger.debug('Failed to parse JSON-LD:', (parseError as Error).message);
        }
      }

      // Look for microdata
      const recipeElement = $('[itemtype*="Recipe"]').first();
      if (recipeElement.length) {
        return this.parseMicrodataRecipe($, recipeElement);
      }

      return null;
    } catch (error) {
      logger.debug('Structured data parsing failed:', (error as Error).message);
      return null;
    }
  }

  private parseJsonLdRecipe(data: any): ParsedRecipe {
    const recipe: ParsedRecipe = {
      name: data.name || '',
      ingredients: [],
      instructions: '',
      source_url: '',
      available_images: [],
    };

    // Parse ingredients
    if (data.recipeIngredient) {
      recipe.ingredients = data.recipeIngredient.map((ingredient: string) => ({
        name: ingredient.trim(),
        amount: '',
        unit: '',
      }));
    }

    // Parse instructions
    if (data.recipeInstructions) {
      const instructions = data.recipeInstructions.map((instruction: any) => {
        if (typeof instruction === 'string') return instruction;
        return instruction.text || instruction.name || '';
      });
      recipe.instructions = instructions.join('\n\n');
    }

    // Parse times
    if (data.prepTime) {
      recipe.prep_time = this.parseDuration(data.prepTime);
    }
    if (data.cookTime) {
      recipe.cook_time = this.parseDuration(data.cookTime);
    }
    if (data.totalTime) {
      recipe.total_time = this.parseDuration(data.totalTime);
    }

    // Parse other fields
    if (data.recipeYield) {
      recipe.servings = parseInt(data.recipeYield.toString());
    }
    if (data.recipeCuisine) {
      recipe.cuisine = Array.isArray(data.recipeCuisine) 
        ? data.recipeCuisine[0] 
        : data.recipeCuisine;
    }
    if (data.recipeCategory) {
      recipe.category = Array.isArray(data.recipeCategory) 
        ? data.recipeCategory[0] 
        : data.recipeCategory;
    }
    if (data.author) {
      recipe.author = typeof data.author === 'string' 
        ? data.author 
        : data.author.name;
    }
    if (data.description) {
      recipe.description = data.description;
    }

    // Parse nutrition
    if (data.nutrition) {
      recipe.nutrition = {
        calories: data.nutrition.calories,
        protein: data.nutrition.proteinContent,
        carbs: data.nutrition.carbohydrateContent,
        fat: data.nutrition.fatContent,
        fiber: data.nutrition.fiberContent,
        sugar: data.nutrition.sugarContent,
        sodium: data.nutrition.sodiumContent,
      };
    }

    return recipe;
  }

  private parseMicrodataRecipe($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>): ParsedRecipe {
    const recipe: ParsedRecipe = {
      name: element.find('[itemprop="name"]').first().text().trim(),
      ingredients: [],
      instructions: '',
      source_url: '',
      available_images: [],
    };

    // Parse ingredients
    element.find('[itemprop="recipeIngredient"]').each((_, el) => {
      const ingredient = $(el).text().trim();
      if (ingredient) {
        recipe.ingredients.push({
          name: ingredient,
          amount: '',
          unit: '',
        });
      }
    });

    // Parse instructions
    const instructions: string[] = [];
    element.find('[itemprop="recipeInstructions"]').each((_, el) => {
      const instruction = $(el).text().trim();
      if (instruction) {
        instructions.push(instruction);
      }
    });
    recipe.instructions = instructions.join('\n\n');

    // Parse times
    const prepTime = element.find('[itemprop="prepTime"]').attr('datetime');
    if (prepTime) {
      recipe.prep_time = this.parseDuration(prepTime);
    }

    const cookTime = element.find('[itemprop="cookTime"]').attr('datetime');
    if (cookTime) {
      recipe.cook_time = this.parseDuration(cookTime);
    }

    return recipe;
  }

  private async parseBySiteConfig($: cheerio.CheerioAPI, config: SiteConfig): Promise<ParsedRecipe | null> {
    try {
      const recipe: ParsedRecipe = {
        name: '',
        ingredients: [],
        instructions: '',
        source_url: '',
        available_images: [],
      };

      // Parse title
      if (config.selectors.title) {
        recipe.name = $(config.selectors.title).first().text().trim();
      }

      // Parse ingredients
      if (config.selectors.ingredients) {
        $(config.selectors.ingredients).each((_, el) => {
          const ingredient = $(el).text().trim();
          if (ingredient) {
            recipe.ingredients.push({
              name: ingredient,
              amount: '',
              unit: '',
            });
          }
        });
      }

      // Parse instructions
      if (config.selectors.instructions) {
        const instructions: string[] = [];
        $(config.selectors.instructions).each((_, el) => {
          const instruction = $(el).text().trim();
          if (instruction) {
            instructions.push(instruction);
          }
        });
        recipe.instructions = instructions.join('\n\n');
      }

      return recipe.name && recipe.ingredients.length > 0 ? recipe : null;
    } catch (error) {
      logger.debug('Site-specific parsing failed:', (error as Error).message);
      return null;
    }
  }

  private async parseGeneric($: cheerio.CheerioAPI): Promise<ParsedRecipe | null> {
    try {
      const recipe: ParsedRecipe = {
        name: '',
        ingredients: [],
        instructions: '',
        source_url: '',
        available_images: [],
      };

      // Try common title selectors
      const titleSelectors = ['h1', '.recipe-title', '.entry-title', '.post-title'];
      for (const selector of titleSelectors) {
        const title = $(selector).first().text().trim();
        if (title && title.length > 5) {
          recipe.name = title;
          break;
        }
      }

      // Try common ingredient selectors
      const ingredientSelectors = [
        '.recipe-ingredient',
        '.ingredient',
        '.ingredients li',
        '[class*="ingredient"]',
      ];
      
      for (const selector of ingredientSelectors) {
        const elements = $(selector);
        if (elements.length > 2) {
          elements.each((_, el) => {
            const ingredient = $(el).text().trim();
            if (ingredient && ingredient.length > 2) {
              recipe.ingredients.push({
                name: ingredient,
                amount: '',
                unit: '',
              });
            }
          });
          break;
        }
      }

      return recipe.name && recipe.ingredients.length > 0 ? recipe : null;
    } catch (error) {
      logger.debug('Generic parsing failed:', (error as Error).message);
      return null;
    }
  }

  private async extractImages($: cheerio.CheerioAPI, page: Page): Promise<RecipeImage[]> {
    const images: RecipeImage[] = [];
    const seenUrls = new Set<string>();

    try {
      // Common image selectors
      const imageSelectors = [
        '.recipe-image img',
        '.recipe-photo img',
        '.hero-image img',
        '.featured-image img',
        '.recipe-header img',
        '[class*="recipe"] img',
        'img[src*="recipe"]',
        'img[alt*="recipe"]',
      ];

      for (const selector of imageSelectors) {
        $(selector).each((_, el) => {
          const src = $(el).attr('src') || $(el).attr('data-src');
          const alt = $(el).attr('alt') || '';
          
          if (src && !seenUrls.has(src)) {
            seenUrls.add(src);
            
            // Convert relative URLs to absolute
            const absoluteUrl = new URL(src, page.url()).href;
            
            // Determine image type based on context
            let type: RecipeImage['type'] = 'gallery';
            const parent = $(el).parent().attr('class') || '';
            const imgClass = $(el).attr('class') || '';
            
            if (parent.includes('hero') || imgClass.includes('hero')) {
              type = 'hero';
            } else if (parent.includes('ingredient') || alt.includes('ingredient')) {
              type = 'ingredient';
            } else if (parent.includes('step') || alt.includes('step')) {
              type = 'step';
            }

            images.push({
              url: absoluteUrl,
              type,
              alt_text: alt,
              quality_score: this.calculateImageQuality(src, alt),
            });
          }
        });
      }

      // Sort by quality score
      images.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
      
      // Return top 10 images
      return images.slice(0, 10);
    } catch (error) {
      logger.debug('Image extraction failed:', (error as Error).message);
      return [];
    }
  }

  private calculateImageQuality(src: string, alt: string): number {
    let score = 50; // Base score

    // Higher resolution indicators
    if (src.includes('1200') || src.includes('1920')) score += 30;
    else if (src.includes('800') || src.includes('1024')) score += 20;
    else if (src.includes('600')) score += 10;

    // Quality indicators in filename
    if (src.includes('high') || src.includes('hd')) score += 15;
    if (src.includes('thumb') || src.includes('small')) score -= 20;

    // Alt text quality
    if (alt && alt.length > 10) score += 10;
    if (alt.includes('recipe') || alt.includes('food')) score += 5;

    // File format preferences
    if (src.includes('.jpg') || src.includes('.jpeg')) score += 5;
    if (src.includes('.webp')) score += 10;
    if (src.includes('.png')) score += 3;

    return Math.max(0, Math.min(100, score));
  }

  private parseDuration(duration: string): string {
    if (!duration) return '';
    
    // Handle ISO 8601 duration (PT15M)
    if (duration.startsWith('PT')) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes} minutes`;
      }
    }
    
    return duration;
  }
}

export const recipeParser = new RecipeParserService();
