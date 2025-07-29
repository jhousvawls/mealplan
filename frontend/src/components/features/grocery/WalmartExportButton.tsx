import React, { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import WalmartIntegrationService from '../../../services/walmartIntegrationService';
import type { GroceryItem } from '../../../types';

interface WalmartExportButtonProps {
  groceryItems: GroceryItem[];
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  disabled?: boolean;
}

export const WalmartExportButton: React.FC<WalmartExportButtonProps> = ({
  groceryItems,
  className = '',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleWalmartExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Validate grocery items
      const validation = WalmartIntegrationService.validateGroceryItems(groceryItems);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Get user preferences
      const preferences = WalmartIntegrationService.getUserPreferences();

      // Open Walmart with the grocery list
      WalmartIntegrationService.openWalmartWithList(validation.validItems, preferences);

      setExportStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);

    } catch (error) {
      console.error('Failed to export to Walmart:', error);
      setExportStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setExportStatus('idle'), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonText = () => {
    if (isExporting) return 'Opening Walmart...';
    if (exportStatus === 'success') return 'Opened Successfully!';
    if (exportStatus === 'error') return 'Export Failed';
    return 'Shop at Walmart';
  };

  const getButtonVariant = () => {
    if (exportStatus === 'success') return 'primary';
    if (exportStatus === 'error') return 'secondary';
    return variant;
  };

  const isButtonDisabled = disabled || isExporting || groceryItems.length === 0;

  return (
    <div className="relative">
      <Button
        onClick={handleWalmartExport}
        disabled={isButtonDisabled}
        variant={getButtonVariant()}
        size={size}
        className={`
          ${className}
          ${exportStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
          ${exportStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
          transition-all duration-200
        `}
      >
        {showIcon && (
          <ShoppingCartIcon 
            className={`
              ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
              ${isExporting ? 'animate-pulse' : ''}
              mr-2
            `} 
          />
        )}
        {getButtonText()}
      </Button>

      {/* Tooltip for disabled state */}
      {groceryItems.length === 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Add items to your grocery list first
        </div>
      )}
    </div>
  );
};

export default WalmartExportButton;
