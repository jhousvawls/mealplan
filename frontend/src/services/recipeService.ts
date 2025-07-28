import { supabase } from '../lib/supabase';
import type { Recipe, CreateRecipeData, UpdateRecipeData } from '../types';

export class RecipeService {
  // Create a new recipe
  async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({
        name: data.name,
        ingredients: data.ingredients,
        instructions: data.instructions,
        source_url: data.source_url,
        prep_time: data.prep_time,
        cuisine: data.cuisine,
        estimated_nutrition: data.estimated_nutrition,
        featured_image: data.featured_image,
        image_alt_text: data.image_alt_text,
        meal_types: data.meal_types || [],
        dietary_restrictions: data.dietary_restrictions || [],
        difficulty: data.difficulty,
        prep_time_category: data.prep_time_category,
        tags: data.tags || [],
        is_draft: data.is_draft || false,
        owner_id: data.owner_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create recipe: ${error.message}`);
    }

    return recipe;
  }

  // Get all recipes for the current user
  async getUserRecipes(userId: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return recipes || [];
  }

  // Get a single recipe by ID
  async getRecipe(id: string): Promise<Recipe> {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch recipe: ${error.message}`);
    }

    return recipe;
  }

  // Update a recipe
  async updateRecipe(id: string, data: UpdateRecipeData): Promise<Recipe> {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recipe: ${error.message}`);
    }

    return recipe;
  }

  // Delete a recipe
  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  // Search recipes by name or ingredients
  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId)
      .or(`name.ilike.%${query}%, ingredients.cs."${query}"`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search recipes: ${error.message}`);
    }

    return recipes || [];
  }

  // Filter recipes by cuisine
  async getRecipesByCuisine(userId: string, cuisine: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId)
      .eq('cuisine', cuisine)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes by cuisine: ${error.message}`);
    }

    return recipes || [];
  }

  // Parse recipe from URL using backend API
  async parseRecipeFromUrl(url: string): Promise<any> {
    try {
      const response = await fetch('http://localhost:3001/api/recipes/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          options: {
            includeImages: true,
            maxImages: 10,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to parse recipe`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to parse recipe from URL');
    }
  }

  // Import recipe from URL
  async importRecipeFromUrl(url: string, userId: string): Promise<Recipe> {
    try {
      // Parse recipe using backend API
      const parsedData = await this.parseRecipeFromUrl(url);
      
      if (!parsedData.success || !parsedData.recipe) {
        throw new Error('Failed to parse recipe from URL');
      }

      const parsedRecipe = parsedData.recipe;

      // Create the recipe in the database
      const recipeData: CreateRecipeData = {
        name: parsedRecipe.name,
        ingredients: parsedRecipe.ingredients,
        instructions: parsedRecipe.instructions,
        source_url: url,
        prep_time: parsedRecipe.prep_time,
        cuisine: parsedRecipe.cuisine,
        estimated_nutrition: parsedRecipe.estimated_nutrition,
        featured_image: parsedRecipe.images?.[0]?.url,
        image_alt_text: parsedRecipe.images?.[0]?.alt_text,
        owner_id: userId,
        is_draft: true, // Save imported recipes as drafts initially
        tags: [],
      };

      return await this.createRecipe(recipeData);
    } catch (error) {
      throw new Error(`Failed to import recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check for duplicate recipes by URL
  async checkDuplicateRecipe(userId: string, sourceUrl: string): Promise<Recipe | null> {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId)
      .eq('source_url', sourceUrl)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check for duplicates: ${error.message}`);
    }

    return recipes?.[0] || null;
  }

  // Filter recipes by tags
  async getRecipesByTags(userId: string, tags: string[]): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId)
      .contains('tags', tags)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes by tags: ${error.message}`);
    }

    return recipes || [];
  }

  // Filter recipes by dietary restrictions
  async getRecipesByDietaryRestrictions(userId: string, restrictions: string[]): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId)
      .contains('dietary_restrictions', restrictions)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes by dietary restrictions: ${error.message}`);
    }

    return recipes || [];
  }

  // Advanced search with multiple filters
  async searchRecipesAdvanced(userId: string, filters: {
    query?: string;
    cuisine?: string;
    tags?: string[];
    difficulty?: string;
    prepTimeCategory?: string;
    dietaryRestrictions?: string[];
  }): Promise<Recipe[]> {
    let query = supabase
      .from('recipes')
      .select('*')
      .eq('owner_id', userId);

    // Text search
    if (filters.query) {
      query = query.or(`name.ilike.%${filters.query}%, instructions.ilike.%${filters.query}%`);
    }

    // Cuisine filter
    if (filters.cuisine) {
      query = query.eq('cuisine', filters.cuisine);
    }

    // Difficulty filter
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    // Prep time category filter
    if (filters.prepTimeCategory) {
      query = query.eq('prep_time_category', filters.prepTimeCategory);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Dietary restrictions filter
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      query = query.overlaps('dietary_restrictions', filters.dietaryRestrictions);
    }

    query = query.order('created_at', { ascending: false });

    const { data: recipes, error } = await query;

    if (error) {
      throw new Error(`Failed to search recipes: ${error.message}`);
    }

    return recipes || [];
  }
}

export const recipeService = new RecipeService();
