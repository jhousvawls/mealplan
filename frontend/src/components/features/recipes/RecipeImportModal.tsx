import React, { useState } from 'react';
import { X, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useParseRecipe, useImportRecipe, useCheckDuplicate } from '../../../hooks/useRecipesQuery';
import Button from '../../ui/Button';
import { ImageSelectionModal } from './ImageSelectionModal';
import type { RecipeImage } from '../../../types';

interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (recipe: any) => void;
}

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [url, setUrl] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedRecipeData, setParsedRecipeData] = useState<any>(null);
  const [availableImages, setAvailableImages] = useState<RecipeImage[]>([]);
  const [showImageSelection, setShowImageSelection] = useState(false);
  
  const parseRecipe = useParseRecipe();
  const importRecipe = useImportRecipe();
  const checkDuplicate = useCheckDuplicate();
  
  const isImporting = parseRecipe.isPending || importRecipe.isPending || checkDuplicate.isPending;

  const handleImport = async () => {
    if (!url.trim()) return;

    setImportStatus('idle');
    setErrorMessage('');

    try {
      // First check for duplicates
      const duplicate = await checkDuplicate.mutateAsync(url.trim());
      if (duplicate) {
        setImportStatus('error');
        setErrorMessage('This recipe has already been imported to your collection.');
        return;
      }

      // Parse the recipe using the backend API
      const result = await parseRecipe.mutateAsync(url.trim());
      
      if (!result.success || !result.recipe) {
        throw new Error(result.error || 'Failed to parse recipe');
      }

      const parsedData = result.recipe;
      setParsedRecipeData(parsedData);
      
      // Check if there are images to choose from
      if (result.images && result.images.length > 0) {
        setAvailableImages(result.images);
        setShowImageSelection(true);
      } else {
        // No images available, proceed with import
        await finalizeImport(parsedData, undefined, undefined);
      }
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import recipe');
    }
  };

  const finalizeImport = async (recipeData: any, selectedImageUrl?: string, imageAltText?: string) => {
    try {
      const recipe = await importRecipe.mutateAsync(url.trim());
      
      if (recipe) {
        setImportStatus('success');
        onSuccess?.(recipe);
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setImportStatus('error');
        setErrorMessage('Failed to import recipe. Please try again.');
      }
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import recipe');
    }
  };

  const handleImageSelect = (imageUrl?: string, altText?: string) => {
    setShowImageSelection(false);
    finalizeImport(parsedRecipeData, imageUrl, altText);
  };

  const handleImageSelectionClose = () => {
    setShowImageSelection(false);
    setParsedRecipeData(null);
    setAvailableImages([]);
  };

  const handleClose = () => {
    setUrl('');
    setImportStatus('idle');
    setErrorMessage('');
    onClose();
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const canImport = url.trim() && isValidUrl(url.trim()) && !isImporting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Recipe
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                From your favorite food blogs
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipe URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isImporting}
              />
              {url && isValidUrl(url) && (
                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports most recipe websites and food blogs
            </p>
          </div>

          {/* Popular Sources */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Popular Sources
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'AllRecipes.com',
                'Food Network',
                'Bon Appétit',
                'Serious Eats',
                'Tasty',
                'BBC Good Food',
              ].map((source) => (
                <div
                  key={source}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 text-center"
                >
                  {source}
                </div>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {importStatus === 'success' && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Recipe imported successfully!
              </span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport}
            className="flex-1"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Recipe'
            )}
          </Button>
        </div>
      </div>

      {/* Image Selection Modal */}
      <ImageSelectionModal
        isOpen={showImageSelection}
        onClose={handleImageSelectionClose}
        onImageSelect={handleImageSelect}
        recipeName={parsedRecipeData?.name || 'Recipe'}
        availableImages={availableImages}
      />
    </div>
  );
};
