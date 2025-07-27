import React from 'react';
import PageHeader from '../layout/PageHeader';
import Card from '../ui/Card';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "This feature is coming soon!" 
}) => {
  return (
    <div>
      <PageHeader title={title} />
      
      <div className="p-8">
        <Card className="max-w-md mx-auto text-center">
          <div className="py-12">
            <div className="w-16 h-16 bg-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Coming Soon
            </h3>
            <p className="text-text-secondary">
              {description}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoon;
