import React from 'react';
import { CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import type { MealPlan } from '../../../types';
import { formatDate } from '../../../utils/mockData';

interface MealPlanCardProps {
  plan: MealPlan;
  onView: () => void;
  isShared?: boolean;
}

const MealPlanCard: React.FC<MealPlanCardProps> = ({ 
  plan, 
  onView, 
  isShared = false 
}) => {
  const plannedDaysCount = plan.planned_meals?.length || 0;

  return (
    <Card className="dashboard-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary mb-1">
            {plan.plan_name}
          </h3>
          <div className="flex items-center text-text-secondary text-sm">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{formatDate(plan.start_date)}</span>
          </div>
        </div>
        {isShared && (
          <div className="flex items-center text-blue text-sm">
            <UsersIcon className="w-4 h-4 mr-1" />
            <span>Shared</span>
          </div>
        )}
      </div>

      <p className="text-text-secondary mb-4">
        {plannedDaysCount > 0 
          ? `${plannedDaysCount} meals planned`
          : 'No meals planned yet'
        }
      </p>

      <Button 
        onClick={onView}
        variant="primary"
        className="w-full"
      >
        View Plan
      </Button>
    </Card>
  );
};

export default MealPlanCard;
