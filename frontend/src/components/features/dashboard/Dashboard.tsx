import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../layout/PageHeader';
import MealPlanCard from './MealPlanCard';
import CreatePlanCard from './CreatePlanCard';
import type { MealPlan } from '../../../types';
import { mockMealPlans } from '../../../utils/mockData';

// Mock user data - will be replaced with real auth later
const mockUser = {
  id: '1',
  full_name: 'John Doe',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Using mock data for now - will be replaced with real API calls
  const mealPlans = mockMealPlans;
  const sharedPlans: MealPlan[] = []; // No shared plans in mock data yet

  const handleViewPlan = (plan: MealPlan) => {
    navigate(`/plan/${plan.id}`);
  };

  const handleCreatePlan = () => {
    navigate('/plan/create');
  };

  const firstName = mockUser?.full_name?.split(' ')[0] || 'there';

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${firstName}!`} 
      />
      
      <div className="p-8 space-y-8">
        {/* My Meal Plans */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-text-primary">
            My Meal Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onView={() => handleViewPlan(plan)}
              />
            ))}
            <CreatePlanCard onClick={handleCreatePlan} />
          </div>
        </section>

        {/* Shared Plans */}
        {sharedPlans && sharedPlans.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Shared With Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedPlans.map((plan) => (
                <MealPlanCard
                  key={plan.id}
                  plan={plan}
                  onView={() => handleViewPlan(plan)}
                  isShared
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
