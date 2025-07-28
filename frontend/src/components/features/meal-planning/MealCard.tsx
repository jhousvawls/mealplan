import React, { useState } from 'react';
import { EllipsisVerticalIcon, ClockIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import type { PlannedMeal, DayOfWeek, RecipeUsageAnalysis } from '../../../types';
import { useRemoveMealFromPlan } from '../../../hooks/useMealPlansQuery';
import Button from '../../ui/Button';

interface MealCardProps {
  meal: PlannedMeal;
  dayOfWeek: DayOfWeek;
  className?: string;
  compact?: boolean;
  // Phase 2 Week 2: Recipe usage analysis
  usageAnalysis?: RecipeUsageAnalysis;
  highlightedRecipeId?: string | null;
  onRecipeTouch?: (recipeId: string) => void;
}

export function MealCard({ 
  meal, 
  dayOfWeek, 
  className = '', 
  compact = false,
  usageAnalysis,
  highlightedRecipeId,
  onRecipeTouch
}: MealCardProps) {
  const [showActions, setShowActions] = useState(false);
  const removeMealMutation = useRemoveMealFromPlan();

  const handleRemoveMeal = () => {
    removeMealMutation.mutate(meal.id);
    setShowActions(false);
  };

  const handleDuplicateMeal = () => {
    // TODO: Implement meal duplication
    console.log('Duplicate meal:', meal.id);
    setShowActions(false);
  };

  const handleViewRecipe = () => {
    // TODO: Implement recipe view modal
    console.log('View recipe:', meal.recipe?.id);
    setShowActions(false);
  };

  const handleCardTouch = () => {
    if (meal.recipe_id && onRecipeTouch) {
      onRecipeTouch(meal.recipe_id);
      // Light haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  const getRecipeImage = (): string => {
    return meal.recipe?.featured_image || '/api/placeholder/150/100';
  };

  const getRecipeName = (): string => {
    return meal.recipe?.name || 'Unknown Recipe';
  };

  const getPrepTime = (): string | null => {
    return meal.recipe?.prep_time || null;
  };

  // Check if this recipe is highlighted
  const isHighlighted = highlightedRecipeId === meal.recipe_id;

  // Get usage count for this recipe
  const usageCount = usageAnalysis?.usageCount || 0;
  const isBatchCookCandidate = usageAnalysis?.isBatchCookCandidate || false;
  const householdPreferences = usageAnalysis?.householdPreferences;

  if (compact) {
    // Compact version - minimal design for small spaces
    return (
      <div className={`meal-card relative ${className}`}>
        <div 
          className={`bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
            isHighlighted ? 'ring-2 ring-blue-300 bg-blue-50' : ''
          }`}
          onClick={handleCardTouch}
        >
          <div className="flex items-center p-2 space-x-2">
            {/* Small Recipe Image */}
            <img
              src={getRecipeImage()}
              alt={getRecipeName()}
              className="w-8 h-8 object-cover rounded flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/150/100';
              }}
            />
            
            {/* Recipe Name and Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <h5 className="font-medium text-gray-900 text-xs truncate">
                  {getRecipeName()}
                </h5>
                
                {/* Compact Repetition Badges */}
                {usageCount >= 2 && (
                  <span className="bg-blue-50 text-blue-700 text-xs px-1 py-0 rounded-full flex-shrink-0" style={{ fontSize: '8px' }}>
                    {usageCount}x
                  </span>
                )}
                {isBatchCookCandidate && (
                  <span className="bg-green-50 text-green-700 text-xs px-1 py-0 rounded-full flex-shrink-0" style={{ fontSize: '8px' }}>
                    👨‍🍳
                  </span>
                )}
                {householdPreferences?.isFavorite && (
                  <span className="bg-yellow-50 text-yellow-700 text-xs px-1 py-0 rounded-full flex-shrink-0" style={{ fontSize: '8px' }}>
                    ⭐
                  </span>
                )}
                {householdPreferences?.isKidsApproved && (
                  <span className="bg-green-50 text-green-700 text-xs px-1 py-0 rounded-full flex-shrink-0" style={{ fontSize: '8px' }}>
                    👶
                  </span>
                )}
              </div>
              
              {getPrepTime() && (
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <ClockIcon className="h-2.5 w-2.5 mr-1" />
                  <span className="truncate">{getPrepTime()}</span>
                </div>
              )}
            </div>

            {/* Compact Actions Menu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <EllipsisVerticalIcon className="h-3 w-3" />
            </button>
          </div>

          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute top-8 right-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-28">
              <div className="py-1">
                <button
                  onClick={handleViewRecipe}
                  className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  onClick={handleDuplicateMeal}
                  className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <DocumentDuplicateIcon className="h-3 w-3 mr-1" />
                  Copy
                </button>
                <button
                  onClick={handleRemoveMeal}
                  disabled={removeMealMutation.isPending}
                  className="w-full px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  {removeMealMutation.isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close actions */}
        {showActions && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowActions(false)}
          />
        )}
      </div>
    );
  }

  // Full version - original design
  return (
    <div className={`meal-card relative ${className}`}>
      <div 
        className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
          isHighlighted ? 'ring-2 ring-blue-300 bg-blue-50' : ''
        }`}
        onClick={handleCardTouch}
      >
        {/* Recipe Image */}
        <div className="relative">
          <img
            src={getRecipeImage()}
            alt={getRecipeName()}
            className="w-full h-20 object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/150/100';
            }}
          />
          
          {/* Repetition Badges - Top Left */}
          {(usageCount >= 2 || isBatchCookCandidate || householdPreferences?.isFavorite || householdPreferences?.isKidsApproved) && (
            <div className="absolute top-2 left-2 flex space-x-1">
              {usageCount >= 2 && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full shadow-sm" style={{ opacity: 0.9 }}>
                  {usageCount}x this week
                </span>
              )}
              {isBatchCookCandidate && (
                <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full shadow-sm" style={{ opacity: 0.9 }}>
                  Batch Cook
                </span>
              )}
            </div>
          )}

          {/* Household Preference Badges - Bottom Left */}
          {(householdPreferences?.isFavorite || householdPreferences?.isKidsApproved) && (
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {householdPreferences?.isFavorite && (
                <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full shadow-sm" style={{ opacity: 0.9 }}>
                  ⭐ Favorite
                </span>
              )}
              {householdPreferences?.isKidsApproved && (
                <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full shadow-sm" style={{ opacity: 0.9 }}>
                  👶 Kids Love
                </span>
              )}
            </div>
          )}
          
          {/* Actions Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="absolute top-2 right-2 p-1 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
          >
            <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
          </button>

          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute top-8 right-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
              <div className="py-1">
                <button
                  onClick={handleViewRecipe}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <span>View Recipe</span>
                </button>
                <button
                  onClick={handleDuplicateMeal}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={handleRemoveMeal}
                  disabled={removeMealMutation.isPending}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  <span>{removeMealMutation.isPending ? 'Removing...' : 'Remove'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="p-3">
          <h5 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
            {getRecipeName()}
          </h5>
          
          {getPrepTime() && (
            <div className="flex items-center text-xs text-gray-500">
              <ClockIcon className="h-3 w-3 mr-1" />
              <span>{getPrepTime()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
