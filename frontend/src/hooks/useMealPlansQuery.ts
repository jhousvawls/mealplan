import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealPlanService } from '../services/mealPlanService';
import type { 
  MealPlan, 
  PlannedMeal, 
  CreateMealPlanData, 
  MealPlanTemplate,
  DayOfWeek,
  MealType,
  RecipeUsageAnalysis,
  WeeklyAnalysis
} from '../types';

// Query keys
export const mealPlanKeys = {
  all: ['meal-plans'] as const,
  lists: () => [...mealPlanKeys.all, 'list'] as const,
  list: (userId: string) => [...mealPlanKeys.lists(), userId] as const,
  details: () => [...mealPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...mealPlanKeys.details(), id] as const,
  week: (userId: string, startDate: string) => [...mealPlanKeys.all, 'week', userId, startDate] as const,
  currentWeek: (userId: string) => [...mealPlanKeys.all, 'current-week', userId] as const,
  templates: () => [...mealPlanKeys.all, 'templates'] as const,
  // Phase 2 Week 2: Recipe usage analysis
  recipeUsage: (mealPlanId: string) => [...mealPlanKeys.all, 'recipe-usage', mealPlanId] as const,
  weeklyAnalysis: (mealPlanId: string) => [...mealPlanKeys.all, 'weekly-analysis', mealPlanId] as const,
};

// Get all meal plans for a user
export function useMealPlans(userId: string) {
  return useQuery({
    queryKey: mealPlanKeys.list(userId),
    queryFn: () => mealPlanService.getUserMealPlans(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get a specific meal plan
export function useMealPlan(id: string) {
  return useQuery({
    queryKey: mealPlanKeys.detail(id),
    queryFn: () => mealPlanService.getMealPlan(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get meal plan for a specific week
export function useMealPlanForWeek(userId: string, startDate: string) {
  return useQuery({
    queryKey: mealPlanKeys.week(userId, startDate),
    queryFn: () => mealPlanService.getMealPlanForWeek(userId, startDate),
    enabled: !!userId && !!startDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get current week's meal plan
export function useCurrentWeekMealPlan(userId: string) {
  return useQuery({
    queryKey: mealPlanKeys.currentWeek(userId),
    queryFn: () => mealPlanService.getCurrentWeekMealPlan(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get meal plan templates
export function useMealPlanTemplates() {
  return useQuery({
    queryKey: mealPlanKeys.templates(),
    queryFn: () => mealPlanService.getMealPlanTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutes (templates don't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Create meal plan mutation
export function useCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMealPlanData) => mealPlanService.createMealPlan(data),
    onSuccess: (newMealPlan) => {
      // Invalidate and refetch meal plans list
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.list(newMealPlan.owner_id) });
      
      // Add the new meal plan to the cache
      queryClient.setQueryData(
        mealPlanKeys.detail(newMealPlan.id),
        newMealPlan
      );

      // Update current week cache if this is the current week
      const weekStart = mealPlanService.getWeekStart(new Date());
      if (newMealPlan.start_date === weekStart) {
        queryClient.setQueryData(
          mealPlanKeys.currentWeek(newMealPlan.owner_id),
          newMealPlan
        );
      }
    },
  });
}

// Update meal plan mutation
export function useUpdateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MealPlan> }) =>
      mealPlanService.updateMealPlan(id, updates),
    onSuccess: (updatedMealPlan) => {
      // Update the specific meal plan in cache
      queryClient.setQueryData(
        mealPlanKeys.detail(updatedMealPlan.id),
        updatedMealPlan
      );

      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.list(updatedMealPlan.owner_id) });
    },
  });
}

// Delete meal plan mutation
export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mealPlanService.deleteMealPlan(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: mealPlanKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() });
    },
  });
}

// Add meal to plan mutation
export function useAddMealToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mealPlanId,
      recipeId,
      dayOfWeek,
      mealType,
    }: {
      mealPlanId: string;
      recipeId: string;
      dayOfWeek: DayOfWeek;
      mealType: MealType;
    }) => mealPlanService.addMealToPlan(mealPlanId, recipeId, dayOfWeek, mealType),
    onSuccess: (newPlannedMeal) => {
      // Invalidate the meal plan to refetch with new meal
      queryClient.invalidateQueries({ 
        queryKey: mealPlanKeys.detail(newPlannedMeal.meal_plan_id) 
      });
      
      // Also invalidate week and current week queries
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.all });
    },
  });
}

// Remove meal from plan mutation
export function useRemoveMealFromPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plannedMealId: string) => mealPlanService.removeMealFromPlan(plannedMealId),
    onSuccess: () => {
      // Invalidate all meal plan queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.all });
    },
  });
}

// Move meal mutation
export function useMoveMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      plannedMealId,
      newDayOfWeek,
      newMealType,
    }: {
      plannedMealId: string;
      newDayOfWeek: DayOfWeek;
      newMealType: MealType;
    }) => mealPlanService.moveMeal(plannedMealId, newDayOfWeek, newMealType),
    onSuccess: (updatedPlannedMeal) => {
      // Invalidate the meal plan to refetch with updated meal
      queryClient.invalidateQueries({ 
        queryKey: mealPlanKeys.detail(updatedPlannedMeal.meal_plan_id) 
      });
    },
  });
}

// Copy meal plan mutation
export function useCopyMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceMealPlanId,
      newPlanName,
      newStartDate,
      userId,
    }: {
      sourceMealPlanId: string;
      newPlanName: string;
      newStartDate: string;
      userId: string;
    }) => mealPlanService.copyMealPlan(sourceMealPlanId, newPlanName, newStartDate, userId),
    onSuccess: (newMealPlan) => {
      // Invalidate and refetch meal plans list
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.list(newMealPlan.owner_id) });
      
      // Add the new meal plan to the cache
      queryClient.setQueryData(
        mealPlanKeys.detail(newMealPlan.id),
        newMealPlan
      );
    },
  });
}

// Generate grocery list mutation
export function useGenerateGroceryList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealPlanId: string) => mealPlanService.generateGroceryList(mealPlanId),
    onSuccess: (_, mealPlanId) => {
      // Invalidate the meal plan to refetch with updated grocery list
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.detail(mealPlanId) });
    },
  });
}

// Get or create current week meal plan mutation
export function useGetOrCreateCurrentWeekMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => mealPlanService.getOrCreateCurrentWeekMealPlan(userId),
    onSuccess: (mealPlan) => {
      // Update current week cache
      queryClient.setQueryData(
        mealPlanKeys.currentWeek(mealPlan.owner_id),
        mealPlan
      );

      // Also update the detail cache
      queryClient.setQueryData(
        mealPlanKeys.detail(mealPlan.id),
        mealPlan
      );

      // Invalidate the list to ensure it includes the new plan
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.list(mealPlan.owner_id) });
    },
  });
}

// Phase 2 Week 2: Recipe Usage Analysis Hooks

// Get recipe usage analysis for a meal plan
export function useRecipeUsageAnalysis(mealPlanId: string) {
  return useQuery({
    queryKey: mealPlanKeys.recipeUsage(mealPlanId),
    queryFn: () => mealPlanService.getRecipeUsageAnalysis(mealPlanId),
    enabled: !!mealPlanId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get weekly analysis with variety warnings and suggestions
export function useWeeklyAnalysis(mealPlanId: string) {
  return useQuery({
    queryKey: mealPlanKeys.weeklyAnalysis(mealPlanId),
    queryFn: () => mealPlanService.getWeeklyAnalysis(mealPlanId),
    enabled: !!mealPlanId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
