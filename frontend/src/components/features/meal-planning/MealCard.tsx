import React, { useState } from 'react';
import { EllipsisVerticalIcon, ClockIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import type { PlannedMeal, DayOfWeek } from '../../../types';
import { useRemoveMealFromPlan } from '../../../hooks/useMealPlansQuery';
import Button from '../../ui/Button';

interface MealCardProps {
  meal: PlannedMeal;
  dayOfWeek: DayOfWeek;
  className?: string;
}

export function MealCard({ meal, dayOfWeek, className = '' }: MealCardProps) {
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

  const getRecipeImage = (): string => {
    return meal.recipe?.featured_image || '/api/placeholder/150/100';
  };

  const getRecipeName = (): string => {
    return meal.recipe?.name || 'Unknown Recipe';
  };

  const getPrepTime = (): string | null => {
    return meal.recipe?.prep_time || null;
  };

  return (
    <div className={`meal-card relative ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
          
          {/* Actions Menu Button */}
          <button
            onClick={() => setShowActions(!showActions)}
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
