import { supabase } from '../lib/supabase';
import type { Recipe, CreateRecipeData, UpdateRecipeData } from '../types';

export class RecipeService {
  // Helper to check if we're in development mode with dummy user
  private isDummyUser(userId: string): boolean {
    return userId === 'dummy-user-123';
  }

  // Development storage helpers
  private getLocalRecipes(): Recipe[] {
    const stored = localStorage.getItem('dev-recipes');
    return stored ? JSON.parse(stored) : [];
  }

  private saveLocalRecipes(recipes: Recipe[]): void {
    localStorage.setItem('dev-recipes', JSON.stringify(recipes));
  }

  // Create a new recipe
  async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    // Use local storage for dummy user
    if (this.isDummyUser(data.owner_id)) {
      const recipe: Recipe = {
        id: `recipe-${Date.now()}`,
        name: data.name,
        ingredients: data.ingredients,
        instructions: data.instructions,
        source_url: data.source_url,
        prep_time: data.prep_time,
        cuisine: data.cuisine,
        estimated_nutrition: data.estimated_nutrition,
        owner_id: data.owner_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const recipes = this.getLocalRecipes();
      recipes.unshift(recipe);
      this.saveLocalRecipes(recipes);
      return recipe;
    }

    // Use Supabase for real users
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
    // Use local storage for dummy user
    if (this.isDummyUser(userId)) {
      return this.getLocalRecipes();
    }

    // Use Supabase for real users
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

  // Import recipe from URL
  async importRecipeFromUrl(url: string, userId: string): Promise<Recipe> {
    try {
      // For development, use mock data from static file
      // In production, this would call a real recipe parsing API
      const response = await fetch('/api/parse-recipe.json');

      if (!response.ok) {
        throw new Error('Failed to parse recipe from URL');
      }

      const parsedRecipe = await response.json();

      // Create the recipe in the database
      const recipeData: CreateRecipeData = {
        name: parsedRecipe.name,
        ingredients: parsedRecipe.ingredients,
        instructions: parsedRecipe.instructions,
        source_url: url,
        prep_time: parsedRecipe.prep_time,
        cuisine: parsedRecipe.cuisine,
        estimated_nutrition: parsedRecipe.nutrition,
        owner_id: userId,
      };

      return await this.createRecipe(recipeData);
    } catch (error) {
      throw new Error(`Failed to import recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const recipeService = new RecipeService();
