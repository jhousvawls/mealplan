import React from 'react';
import { clsx } from 'clsx';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className,
}) => {
  return (
    <header className={clsx('page-header', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div className="page-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
