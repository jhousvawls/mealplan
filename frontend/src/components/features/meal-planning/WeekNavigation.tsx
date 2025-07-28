import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

interface WeekNavigationProps {
  currentWeekStart: string;
  onWeekChange: (direction: 'prev' | 'next') => void;
  className?: string;
}

export function WeekNavigation({ currentWeekStart, onWeekChange, className = '' }: WeekNavigationProps) {
  const formatWeekRange = (weekStart: string): string => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const todayWeekStart = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    todayWeekStart.setDate(diff);
    
    return todayWeekStart.toISOString().split('T')[0] === currentWeekStart;
  };

  return (
    <div className={`week-navigation ${className}`}>
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Previous Week Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange('prev')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Week Range Display */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatWeekRange(currentWeekStart)}
          </h2>
          {isCurrentWeek() && (
            <span className="text-sm text-blue-600 font-medium">
              This Week
            </span>
          )}
        </div>

        {/* Next Week Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange('next')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Week Indicators */}
      <div className="md:hidden mt-4">
        <div className="flex justify-center space-x-1">
          {[-2, -1, 0, 1, 2].map((offset) => {
            const weekDate = new Date(currentWeekStart);
            weekDate.setDate(weekDate.getDate() + (offset * 7));
            const isActive = offset === 0;
            
            return (
              <button
                key={offset}
                onClick={() => {
                  if (offset < 0) {
                    for (let i = 0; i < Math.abs(offset); i++) {
                      onWeekChange('prev');
                    }
                  } else if (offset > 0) {
                    for (let i = 0; i < offset; i++) {
                      onWeekChange('next');
                    }
                  }
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  isActive 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Week of ${weekDate.toLocaleDateString()}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
