import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { useRecipes } from '../../../hooks/useRecipesQuery';
import { useAddMealToPlan } from '../../../hooks/useMealPlansQuery';
import type { DayOfWeek, MealType, Recipe } from '../../../types';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface MealAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealSlot: {
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    mealPlanId: string;
  };
}

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack'
};

const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export function MealAssignmentModal({ isOpen, onClose, mealSlot }: MealAssignmentModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const { data: recipes = [], isLoading } = useRecipes();
  const addMealMutation = useAddMealToPlan();

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.ingredients.some(ingredient =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedRecipe(null);
    }
  }, [isOpen]);

  const handleAssignMeal = async () => {
    if (!selectedRecipe) return;

    try {
      await addMealMutation.mutateAsync({
        mealPlanId: mealSlot.mealPlanId,
        recipeId: selectedRecipe.id,
        dayOfWeek: mealSlot.dayOfWeek,
        mealType: mealSlot.mealType,
      });
      onClose();
    } catch (error) {
      console.error('Failed to assign meal:', error);
    }
  };

  const getRecipeImage = (recipe: Recipe): string => {
    return recipe.featured_image || '/api/placeholder/150/100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add {MEAL_TYPE_LABELS[mealSlot.mealType]}
                </h3>
                <p className="text-sm text-gray-600">
                  {DAY_LABELS[mealSlot.dayOfWeek]}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Recipe List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🍽️</div>
                  <p className="text-gray-500">
                    {searchQuery ? 'No recipes found matching your search.' : 'No recipes available.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 hover:text-blue-500 text-sm mt-2"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`w-full flex items-center space-x-3 p-3 border rounded-lg text-left transition-colors ${
                        selectedRecipe?.id === recipe.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={getRecipeImage(recipe)}
                        alt={recipe.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/150/100';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {recipe.name}
                        </h4>
                        {recipe.prep_time && (
                          <p className="text-sm text-gray-500">
                            {recipe.prep_time}
                          </p>
                        )}
                        {recipe.cuisine && (
                          <p className="text-xs text-gray-400">
                            {recipe.cuisine}
                          </p>
                        )}
                      </div>
                      {selectedRecipe?.id === recipe.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <Button
              onClick={handleAssignMeal}
              disabled={!selectedRecipe || addMealMutation.isPending}
              loading={addMealMutation.isPending}
              variant="primary"
              className="w-full sm:ml-3 sm:w-auto"
            >
              {addMealMutation.isPending ? 'Adding...' : 'Add Meal'}
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
