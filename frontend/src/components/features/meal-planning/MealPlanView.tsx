import React, { useState, useEffect, useRef } from 'react';
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
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [compactView, setCompactView] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get current week meal plan
  const { data: mealPlan, isLoading, error, refetch } = useCurrentWeekMealPlan(user?.id || '');
  const getOrCreateMealPlan = useGetOrCreateCurrentWeekMealPlan();

  // Initialize current day index based on today
  useEffect(() => {
    const today = new Date();
    const todayDayIndex = DAYS_OF_WEEK.findIndex(day => isToday(day));
    if (todayDayIndex !== -1) {
      setCurrentDayIndex(todayDayIndex);
    }
  }, []);

  // Create meal plan if it doesn't exist
  useEffect(() => {
    if (user && !mealPlan && !isLoading && !error) {
      getOrCreateMealPlan.mutate(user.id);
    }
  }, [user, mealPlan, isLoading, error, getOrCreateMealPlan]);

  // Enhanced mobile navigation functions
  const scrollToDay = (dayIndex: number) => {
    if (scrollContainerRef.current) {
      const dayWidth = compactView ? 192 : 320; // w-48 = 192px, w-80 = 320px
      const scrollPosition = dayIndex * dayWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setCurrentDayIndex(dayIndex);
      
      // Light haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      // Light haptic feedback for successful refresh
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch (error) {
      console.error('Failed to refresh meal plan:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle scroll events to update current day indicator
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const dayWidth = compactView ? 192 : 320; // w-48 = 192px, w-80 = 320px
    const scrollLeft = container.scrollLeft;
    const newDayIndex = Math.round(scrollLeft / dayWidth);
    
    if (newDayIndex !== currentDayIndex && newDayIndex >= 0 && newDayIndex < DAYS_OF_WEEK.length) {
      setCurrentDayIndex(newDayIndex);
    }
  };

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

      {/* Mobile: Enhanced Navigation */}
      <div className="md:hidden">
        {/* Mobile Controls */}
        <div className="flex items-center justify-between mb-4">
          {/* Compact View Toggle */}
          <button
            onClick={() => setCompactView(!compactView)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{compactView ? 'Single Day' : 'Compact'}</span>
          </button>

          {/* Pull to Refresh Button */}
          <button
            onClick={handlePullToRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Horizontal Scrolling Days */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 ${
            compactView ? 'space-x-2' : 'space-x-4'
          }`}
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {DAYS_OF_WEEK.map((dayOfWeek, index) => (
            <div
              key={dayOfWeek}
              className={`flex-none snap-start ${
                compactView 
                  ? 'w-48' // Compact: ~3 days visible
                  : 'w-80' // Normal: ~1.5 days visible
              } ${index === DAYS_OF_WEEK.length - 1 ? '' : 'mr-4'}`}
            >
              <DayColumn
                dayOfWeek={dayOfWeek}
                date={getDateForDay(dayOfWeek)}
                meals={getMealsForDay(dayOfWeek)}
                onAddMeal={(mealType: MealType) => handleAddMeal(dayOfWeek, mealType)}
                isToday={isToday(dayOfWeek)}
                className="h-full"
                compact={compactView}
              />
            </div>
          ))}
        </div>
        
        {/* Enhanced Day Indicators */}
        <div className="flex justify-center items-center space-x-3 mt-4">
          {DAYS_OF_WEEK.map((dayOfWeek, index) => {
            const isCurrentDay = index === currentDayIndex;
            const isTodayDay = isToday(dayOfWeek);
            
            return (
              <button
                key={dayOfWeek}
                onClick={() => scrollToDay(index)}
                className={`relative transition-all duration-200 ${
                  isCurrentDay ? 'transform scale-125' : 'hover:scale-110'
                }`}
                aria-label={`Go to ${DAY_LABELS[dayOfWeek]}`}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    isTodayDay
                      ? 'bg-blue-500 ring-2 ring-blue-200'
                      : isCurrentDay
                      ? 'bg-gray-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
                {/* Day label for current day */}
                {isCurrentDay && (
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                    {DAY_LABELS[dayOfWeek]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current day info */}
        <div className="text-center mt-8 mb-4">
          <p className="text-sm text-gray-500">
            Viewing {DAY_LABELS[DAYS_OF_WEEK[currentDayIndex]]} • 
            {getDateForDay(DAYS_OF_WEEK[currentDayIndex]).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
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
