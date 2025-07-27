import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Card from '../../ui/Card';

interface CreatePlanCardProps {
  onClick: () => void;
}

const CreatePlanCard: React.FC<CreatePlanCardProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="dashboard-card-create touch-target group"
    >
      <div className="w-16 h-16 rounded-full bg-background-hover group-hover:bg-blue group-hover:bg-opacity-10 flex items-center justify-center mb-4 transition-colors">
        <PlusIcon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-text-secondary group-hover:text-blue transition-colors">
        Create New Plan
      </h3>
      <p className="text-sm text-center text-text-secondary">
        Start planning your meals for the week
      </p>
    </button>
  );
};

export default CreatePlanCard;
