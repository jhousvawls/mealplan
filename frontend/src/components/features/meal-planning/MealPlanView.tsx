import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrentWeekMealPlan, useGetOrCreateCurrentWeekMealPlan } from '../../../hooks/useMealPlansQuery';
import { mealPlanService } from '../../../services/mealPlanService';
import type { MealPlan, DayOfWeek, MealType } from '../../../types';
import { WeekNavigation } from './WeekNavigation';
import { DayColumn } from './DayColumn';
import { MealAssignmentModal } from './MealAssignmentModal';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface MealPlanViewProps {
  className?: string;
}

interface SelectedMealSlot {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  mealPlanId: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue', 
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

export function MealPlanView({ className = '' }: MealPlanViewProps) {
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => 
    mealPlanService.getWeekStart(new Date())
  );
  const [selectedMealSlot, setSelectedMealSlot] = useState<SelectedMealSlot | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Get current week meal plan
  const { data: mealPlan, isLoading, error } = useCurrentWeekMealPlan(user?.id || '');
  const getOrCreateMealPlan = useGetOrCreateCurrentWeekMealPlan();

  // Create meal plan if it doesn't exist
  useEffect(() => {
    if (user && !mealPlan && !isLoading && !error) {
      getOrCreateMealPlan.mutate(user.id);
    }
  }, [user, mealPlan, isLoading, error, getOrCreateMealPlan]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(currentWeekStart);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    
    setCurrentWeekStart(mealPlanService.getWeekStart(newDate));
  };

  const handleAddMeal = (dayOfWeek: DayOfWeek, mealType: MealType) => {
    if (!mealPlan) return;
    
    setSelectedMealSlot({
      dayOfWeek,
      mealType,
      mealPlanId: mealPlan.id
    });
    setShowAssignmentModal(true);
  };

  const handleCloseModal = () => {
    setShowAssignmentModal(false);
    setSelectedMealSlot(null);
  };

  const getDateForDay = (dayOfWeek: DayOfWeek): Date => {
    const weekStart = new Date(currentWeekStart);
    const dayIndex = DAYS_OF_WEEK.indexOf(dayOfWeek);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    return date;
  };

  const isToday = (dayOfWeek: DayOfWeek): boolean => {
    const today = new Date();
    const dayDate = getDateForDay(dayOfWeek);
    return today.toDateString() === dayDate.toDateString();
  };

  const getMealsForDay = (dayOfWeek: DayOfWeek) => {
    if (!mealPlan?.planned_meals) return [];
    return mealPlan.planned_meals.filter(meal => meal.day_of_week === dayOfWeek);
  };

  if (isLoading) {
    return (
      <div className={`meal-plan-view ${className}`}>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`meal-plan-view ${className}`}>
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load meal plan
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading your meal plan. Please try again.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className={`meal-plan-view ${className}`}>
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Creating your meal plan...
          </h3>
          <p className="text-gray-600">
            Setting up your weekly meal plan for the first time.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`meal-plan-view ${className}`}>
      {/* Week Navigation */}
      <WeekNavigation
        currentWeekStart={currentWeekStart}
        onWeekChange={handleWeekChange}
        className="mb-6"
      />

      {/* Mobile: Horizontal Scrolling Days */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
          {DAYS_OF_WEEK.map((dayOfWeek) => (
            <div
              key={dayOfWeek}
              className="flex-none w-80 snap-start mr-4 last:mr-0"
            >
              <DayColumn
                dayOfWeek={dayOfWeek}
                date={getDateForDay(dayOfWeek)}
                meals={getMealsForDay(dayOfWeek)}
                onAddMeal={(mealType: MealType) => handleAddMeal(dayOfWeek, mealType)}
                isToday={isToday(dayOfWeek)}
                className="h-full"
              />
            </div>
          ))}
        </div>
        
        {/* Day Indicators */}
        <div className="flex justify-center space-x-2 mt-4">
          {DAYS_OF_WEEK.map((dayOfWeek) => (
            <div
              key={dayOfWeek}
              className={`w-2 h-2 rounded-full ${
                isToday(dayOfWeek) 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Full Grid */}
      <div className="hidden md:grid md:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((dayOfWeek) => (
          <DayColumn
            key={dayOfWeek}
            dayOfWeek={dayOfWeek}
            date={getDateForDay(dayOfWeek)}
            meals={getMealsForDay(dayOfWeek)}
            onAddMeal={(mealType: MealType) => handleAddMeal(dayOfWeek, mealType)}
            isToday={isToday(dayOfWeek)}
          />
        ))}
      </div>

      {/* Empty State */}
      {mealPlan.planned_meals?.length === 0 && (
        <Card className="p-8 text-center mt-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start planning your week
          </h3>
          <p className="text-gray-600 mb-4">
            Tap the + buttons to add meals to your weekly plan
          </p>
          <Button
            onClick={() => handleAddMeal('monday', 'dinner')}
            variant="primary"
          >
            Add your first meal
          </Button>
        </Card>
      )}

      {/* Recipe Assignment Modal */}
      {showAssignmentModal && selectedMealSlot && (
        <MealAssignmentModal
          isOpen={showAssignmentModal}
          onClose={handleCloseModal}
          mealSlot={selectedMealSlot}
        />
      )}
    </div>
  );
}
