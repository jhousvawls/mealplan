import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';
import type { Recipe, CreateRecipeData, UpdateRecipeData } from '../types';

// Query keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (userId: string) => [...recipeKeys.lists(), userId] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  search: (userId: string, query: string) => [...recipeKeys.all, 'search', userId, query] as const,
  cuisine: (userId: string, cuisine: string) => [...recipeKeys.all, 'cuisine', userId, cuisine] as const,
};

// Get all recipes for the current user
export const useRecipes = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: recipeKeys.list(user?.id || ''),
    queryFn: () => recipeService.getUserRecipes(user!.id),
    enabled: !!user?.id,
  });
};

// Get a single recipe by ID
export const useRecipe = (id: string | null) => {
  return useQuery({
    queryKey: recipeKeys.detail(id || ''),
    queryFn: () => recipeService.getRecipe(id!),
    enabled: !!id,
  });
};

// Search recipes
export const useSearchRecipes = (query: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: recipeKeys.search(user?.id || '', query),
    queryFn: () => recipeService.searchRecipes(user!.id, query),
    enabled: !!user?.id && query.length > 0,
  });
};

// Get recipes by cuisine
export const useRecipesByCuisine = (cuisine: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: recipeKeys.cuisine(user?.id || '', cuisine),
    queryFn: () => recipeService.getRecipesByCuisine(user!.id, cuisine),
    enabled: !!user?.id && !!cuisine,
  });
};

// Create recipe mutation
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: Omit<CreateRecipeData, 'owner_id'>) =>
      recipeService.createRecipe({ ...data, owner_id: user!.id }),
    onSuccess: (newRecipe) => {
      // Update the recipes list cache
      queryClient.setQueryData(
        recipeKeys.list(user!.id),
        (oldData: Recipe[] | undefined) => {
          return oldData ? [newRecipe, ...oldData] : [newRecipe];
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
};

// Update recipe mutation
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipeData }) =>
      recipeService.updateRecipe(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: recipeKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: recipeKeys.list(user!.id) });
      
      // Snapshot previous values
      const previousRecipe = queryClient.getQueryData(recipeKeys.detail(id));
      const previousRecipes = queryClient.getQueryData(recipeKeys.list(user!.id));
      
      // Optimistically update recipe detail
      queryClient.setQueryData(recipeKeys.detail(id), (old: Recipe | undefined) => {
        return old ? { ...old, ...data, updated_at: new Date().toISOString() } : undefined;
      });
      
      // Optimistically update recipes list
      queryClient.setQueryData(recipeKeys.list(user!.id), (old: Recipe[] | undefined) => {
        return old?.map(recipe => 
          recipe.id === id 
            ? { ...recipe, ...data, updated_at: new Date().toISOString() }
            : recipe
        );
      });
      
      return { previousRecipe, previousRecipes };
    },
    onError: (err, { id }, context) => {
      // Rollback optimistic updates
      if (context?.previousRecipe) {
        queryClient.setQueryData(recipeKeys.detail(id), context.previousRecipe);
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(recipeKeys.list(user!.id), context.previousRecipes);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.list(user!.id) });
    },
  });
};

// Delete recipe mutation
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => recipeService.deleteRecipe(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: recipeKeys.list(user!.id) });
      
      // Snapshot previous value
      const previousRecipes = queryClient.getQueryData(recipeKeys.list(user!.id));
      
      // Optimistically remove recipe
      queryClient.setQueryData(recipeKeys.list(user!.id), (old: Recipe[] | undefined) => {
        return old?.filter(recipe => recipe.id !== id);
      });
      
      return { previousRecipes };
    },
    onError: (err, id, context) => {
      // Rollback optimistic update
      if (context?.previousRecipes) {
        queryClient.setQueryData(recipeKeys.list(user!.id), context.previousRecipes);
      }
    },
    onSuccess: (data, id) => {
      // Remove recipe detail from cache
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: recipeKeys.list(user!.id) });
    },
  });
};

// Parse recipe from URL mutation
export const useParseRecipe = () => {
  return useMutation({
    mutationFn: (url: string) => recipeService.parseRecipeFromUrl(url),
  });
};

// Import recipe from URL mutation
export const useImportRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (url: string) => recipeService.importRecipeFromUrl(url, user!.id),
    onSuccess: (newRecipe) => {
      // Update the recipes list cache
      queryClient.setQueryData(
        recipeKeys.list(user!.id),
        (oldData: Recipe[] | undefined) => {
          return oldData ? [newRecipe, ...oldData] : [newRecipe];
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
};

// Check for duplicate recipe mutation
export const useCheckDuplicate = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (sourceUrl: string) => 
      recipeService.checkDuplicateRecipe(user!.id, sourceUrl),
  });
};
