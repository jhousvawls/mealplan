import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Card from '../../ui/Card';

interface CreatePlanCardProps {
  onClick: () => void;
}

const CreatePlanCard: React.FC<CreatePlanCardProps> = ({ onClick }) => {
  return (
    <Card className="dashboard-card create-plan-card">
      <button
        onClick={onClick}
        className="w-full h-full flex flex-col items-center justify-center p-8 text-text-secondary hover:text-blue transition-colors group"
      >
        <div className="w-16 h-16 rounded-full bg-background-hover group-hover:bg-blue group-hover:bg-opacity-10 flex items-center justify-center mb-4 transition-colors">
          <PlusIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Create New Plan</h3>
        <p className="text-sm text-center">
          Start planning your meals for the week
        </p>
      </button>
    </Card>
  );
};

export default CreatePlanCard;
