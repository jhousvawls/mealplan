import React from 'react';
import { clsx } from 'clsx';
import type { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  actions,
  ...props
}) => {
  return (
    <div className={clsx('card', className)} {...props}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div className="flex-1">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
