import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { ParsedRecipe, RecipeImage, ScrapingResult, SiteConfig } from '../types';

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
      logger.info('Initializing Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      logger.info('Puppeteer browser initialized successfully');
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Puppeteer browser closed');
    }
  }

  async parseRecipe(url: string): Promise<ScrapingResult> {
    try {
      await this.initializeBrowser();
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser');
      }

      const page = await this.browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      logger.info(`Navigating to URL: ${url}`);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Try to parse using structured data first
      let recipe = await this.parseStructuredData($);
      
      // If no structured data, try site-specific parsing
      if (!recipe) {
        const domain = new URL(url).hostname.replace('www.', '');
        const siteConfig = this.siteConfigs.find(config => 
          config.domains.some(d => domain.includes(d))
        );
        
        if (siteConfig) {
          recipe = await this.parseBySiteConfig($, siteConfig);
        } else {
          recipe = await this.parseGeneric($);
        }
      }

      // Extract images
      const images = await this.extractImages($, page);

      // Get metadata
      const metadata = {
        title: $('title').text() || '',
        description: $('meta[name="description"]').attr('content') || '',
        siteName: $('meta[property="og:site_name"]').attr('content') || '',
        favicon: $('link[rel="icon"]').attr('href') || '',
      };

      await page.close();

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

    } catch (error) {
      logger.error('Recipe parsing failed:', { url, error: (error as Error).message });
      return {
        recipe: undefined,
        images: [],
        metadata: { title: '', description: '', siteName: '', favicon: '' },
        success: false,
        error: (error as Error).message,
      };
    }
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
