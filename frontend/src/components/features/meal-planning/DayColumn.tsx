import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { DayOfWeek, MealType, PlannedMeal } from '../../../types';
import { MealCard } from './MealCard';
import Button from '../../ui/Button';

interface DayColumnProps {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: PlannedMeal[];
  onAddMeal: (mealType: MealType) => void;
  isToday?: boolean;
  className?: string;
  compact?: boolean;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks'
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

const DAY_SHORT_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

export function DayColumn({ 
  dayOfWeek, 
  date, 
  meals, 
  onAddMeal, 
  isToday = false, 
  className = '',
  compact = false
}: DayColumnProps) {
  const getMealsForType = (mealType: MealType): PlannedMeal[] => {
    return meals.filter(meal => meal.meal_type === mealType);
  };

  const formatDate = (date: Date): string => {
    return date.getDate().toString();
  };

  // In compact mode, only show meals that have content or the most important meal types
  const visibleMealTypes = compact 
    ? MEAL_TYPES.filter(mealType => {
        const mealsForType = getMealsForType(mealType);
        return mealsForType.length > 0 || mealType === 'dinner'; // Always show dinner in compact
      })
    : MEAL_TYPES;

  return (
    <div className={`day-column ${className}`}>
      {/* Day Header */}
      <div className={`day-header ${compact ? 'p-2' : 'p-3'} rounded-t-lg border-b ${
        isToday 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${
            isToday ? 'text-blue-700' : 'text-gray-600'
          }`}>
            <span className="hidden md:inline">{compact ? DAY_SHORT_LABELS[dayOfWeek] : DAY_LABELS[dayOfWeek]}</span>
            <span className="md:hidden">{DAY_SHORT_LABELS[dayOfWeek]}</span>
          </div>
          <div className={`${compact ? 'text-base' : 'text-lg'} font-bold ${
            isToday ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {formatDate(date)}
          </div>
          {isToday && !compact && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              Today
            </div>
          )}
          {isToday && compact && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
          )}
        </div>
      </div>

      {/* Meal Sections */}
      <div className={`day-content bg-white rounded-b-lg border border-t-0 border-gray-200 ${
        compact ? 'min-h-48' : 'min-h-96'
      }`}>
        {visibleMealTypes.map((mealType) => {
          const mealsForType = getMealsForType(mealType);
          
          return (
            <div key={mealType} className="meal-section border-b border-gray-100 last:border-b-0">
              {/* Meal Type Header */}
              <div className={`meal-type-header ${compact ? 'p-2' : 'p-3'} bg-gray-25`}>
                <div className="flex items-center justify-between">
                  <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                    {compact ? mealType.charAt(0).toUpperCase() + mealType.slice(1) : MEAL_TYPE_LABELS[mealType]}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddMeal(mealType)}
                    className={`${compact ? 'p-0.5 h-5 w-5' : 'p-1 h-6 w-6'} text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full`}
                  >
                    <PlusIcon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </div>
              </div>

              {/* Meal Cards */}
              <div className={`meal-cards ${compact ? 'p-1 space-y-1 min-h-8' : 'p-2 space-y-2 min-h-16'}`}>
                {mealsForType.length > 0 ? (
                  mealsForType.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      dayOfWeek={dayOfWeek}
                      className="w-full"
                      compact={compact}
                    />
                  ))
                ) : (
                  <div className="empty-meal-slot">
                    <button
                      onClick={() => onAddMeal(mealType)}
                      className={`w-full ${compact ? 'h-8 text-xs' : 'h-12 text-sm'} border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center group`}
                    >
                      <PlusIcon className={`${compact ? 'h-3 w-3 mr-1' : 'h-5 w-5 mr-2'} group-hover:scale-110 transition-transform`} />
                      <span>
                        {compact 
                          ? '+' 
                          : `Add ${MEAL_TYPE_LABELS[mealType].toLowerCase()}`
                        }
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
