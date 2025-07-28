import { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';
import type { Recipe, CreateRecipeData, UpdateRecipeData } from '../types';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all recipes for the current user
  const fetchRecipes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const userRecipes = await recipeService.getUserRecipes(user.id);
      setRecipes(userRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  // Create a new recipe
  const createRecipe = async (data: Omit<CreateRecipeData, 'owner_id'>): Promise<Recipe | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);
      const newRecipe = await recipeService.createRecipe({
        ...data,
        owner_id: user.id,
      });
      setRecipes(prev => [newRecipe, ...prev]);
      return newRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
      return null;
    }
  };

  // Update an existing recipe
  const updateRecipe = async (id: string, data: UpdateRecipeData): Promise<Recipe | null> => {
    try {
      setError(null);
      const updatedRecipe = await recipeService.updateRecipe(id, data);
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? updatedRecipe : recipe
      ));
      return updatedRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
      return null;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await recipeService.deleteRecipe(id);
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      return false;
    }
  };

  // Import recipe from URL
  const importRecipeFromUrl = async (url: string): Promise<Recipe | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);
      const importedRecipe = await recipeService.importRecipeFromUrl(url, user.id);
      setRecipes(prev => [importedRecipe, ...prev]);
      return importedRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
      return null;
    }
  };

  // Search recipes
  const searchRecipes = async (query: string): Promise<Recipe[]> => {
    if (!user) return [];

    try {
      setError(null);
      const searchResults = await recipeService.searchRecipes(user.id, query);
      return searchResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search recipes');
      return [];
    }
  };

  // Filter recipes by cuisine
  const getRecipesByCuisine = async (cuisine: string): Promise<Recipe[]> => {
    if (!user) return [];

    try {
      setError(null);
      const filteredRecipes = await recipeService.getRecipesByCuisine(user.id, cuisine);
      return filteredRecipes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter recipes');
      return [];
    }
  };

  // Load recipes when user changes
  useEffect(() => {
    if (user) {
      fetchRecipes();
    } else {
      setRecipes([]);
      setLoading(false);
    }
  }, [user]);

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    importRecipeFromUrl,
    searchRecipes,
    getRecipesByCuisine,
    refetch: fetchRecipes,
  };
};

// Hook for managing a single recipe
export const useRecipe = (id: string | null) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedRecipe = await recipeService.getRecipe(id);
      setRecipe(fetchedRecipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecipe();
    } else {
      setRecipe(null);
    }
  }, [id]);

  return {
    recipe,
    loading,
    error,
    refetch: fetchRecipe,
  };
};
