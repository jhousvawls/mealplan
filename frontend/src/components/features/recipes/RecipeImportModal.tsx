import React, { useState, useEffect } from 'react';
import { X, Link, Loader2, CheckCircle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { useParseRecipe, useImportRecipe, useCheckDuplicate, useParseRecipeFromText } from '../../../hooks/useRecipesQuery';
import Button from '../../ui/Button';
import { ImageSelectionModal } from './ImageSelectionModal';
import type { RecipeImage } from '../../../types';

interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (recipe: any) => void;
}

type InputMode = 'url' | 'text';

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedRecipeData, setParsedRecipeData] = useState<any>(null);
  const [availableImages, setAvailableImages] = useState<RecipeImage[]>([]);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  const parseRecipe = useParseRecipe();
  const parseRecipeFromText = useParseRecipeFromText();
  const importRecipe = useImportRecipe();
  const checkDuplicate = useCheckDuplicate();
  
  const isImporting = parseRecipe.isPending || parseRecipeFromText.isPending || importRecipe.isPending || checkDuplicate.isPending;

  // Auto-detect input mode based on content
  useEffect(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setInputMode('url');
      return;
    }

    // Check if it looks like a URL
    if (isValidUrl(trimmedInput) || trimmedInput.startsWith('http')) {
      setInputMode('url');
    } else if (trimmedInput.length > 50) {
      // If it's longer text, assume it's recipe content
      setInputMode('text');
    }
  }, [input]);

  const handleImport = async () => {
    if (!input.trim()) return;

    setImportStatus('idle');
    setErrorMessage('');
    setConfidence(null);

    try {
      let result;
      let sourceUrl = '';

      if (inputMode === 'url') {
        // Check for duplicates first
        const duplicate = await checkDuplicate.mutateAsync(input.trim());
        if (duplicate) {
          setImportStatus('error');
          setErrorMessage('This recipe has already been imported to your collection.');
          return;
        }

        // Parse from URL
        result = await parseRecipe.mutateAsync(input.trim());
        sourceUrl = input.trim();
      } else {
        // Parse from text
        const context = detectSocialMediaContext(input);
        const detectedUrl = extractUrlFromText(input);
        
        result = await parseRecipeFromText.mutateAsync({
          text: input.trim(),
          context,
          sourceUrl: detectedUrl,
        });
        
        sourceUrl = detectedUrl || '';
        setConfidence(result.confidence);
      }
      
      if (!result.success || !result.data) {
        // Show helpful error message based on mode
        const fallbackMessage = inputMode === 'url' 
          ? 'Unable to parse this URL. Try copying the recipe text instead.'
          : 'Unable to extract recipe from text. Please check the format and try again.';
        
        throw new Error(result.error || fallbackMessage);
      }

      const parsedData = result.data;
      setParsedRecipeData({ ...parsedData, source_url: sourceUrl });
      
      // Check if there are images to choose from
      if (result.images && result.images.length > 0) {
        setAvailableImages(result.images);
        setShowImageSelection(true);
      } else {
        // No images available, proceed with import
        await finalizeImport({ ...parsedData, source_url: sourceUrl }, undefined, undefined);
      }
    } catch (error) {
      setImportStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Failed to import recipe';
      
      // Add helpful suggestions based on the error and mode
      if (inputMode === 'url' && errorMsg.includes('Failed to parse')) {
        setErrorMessage(`${errorMsg}\n\nTip: Try copying the recipe text from the page instead.`);
      } else if (inputMode === 'text' && errorMsg.includes('Incomplete recipe')) {
        setErrorMessage(`${errorMsg}\n\nTip: Make sure to include ingredients and instructions.`);
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  const finalizeImport = async (recipeData: any, selectedImageUrl?: string, imageAltText?: string) => {
    try {
      // Create recipe data for import
      const importData = {
        ...recipeData,
        featured_image: selectedImageUrl || recipeData.featured_image,
        image_alt_text: imageAltText || recipeData.image_alt_text,
      };

      // For text-based imports, we need to create the recipe directly
      // since we don't have a URL to import from
      const recipe = inputMode === 'text' 
        ? await createRecipeFromParsedData(importData)
        : await importRecipe.mutateAsync(recipeData.source_url);
      
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

  const createRecipeFromParsedData = async (recipeData: any) => {
    // This would need to be implemented in the service layer
    // For now, we'll use the existing import method with a placeholder URL
    return await importRecipe.mutateAsync(recipeData.source_url || 'text-import');
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
    setInput('');
    setInputMode('url');
    setImportStatus('idle');
    setErrorMessage('');
    setConfidence(null);
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

  const detectSocialMediaContext = (text: string): 'social_media' | 'general' => {
    const socialIndicators = ['instagram', 'facebook', 'tiktok', 'recipe video', '👩‍🍳', '🍳', '📱'];
    return socialIndicators.some(indicator => 
      text.toLowerCase().includes(indicator)
    ) ? 'social_media' : 'general';
  };

  const extractUrlFromText = (text: string): string | undefined => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : undefined;
  };

  const canImport = input.trim() && !isImporting;
  const isTextMode = inputMode === 'text';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isTextMode ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
              {isTextMode ? (
                <FileText className={`w-5 h-5 ${isTextMode ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
              ) : (
                <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Recipe
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTextMode ? 'From social media or text' : 'From recipe websites'}
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
          {/* Smart Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isTextMode ? 'Recipe Text' : 'Recipe URL'}
              </label>
              {isTextMode && (
                <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Powered</span>
                </div>
              )}
            </div>
            <div className="relative">
              {isTextMode ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste recipe text from Facebook, Instagram, or any source...

Example:
🍝 Easy Pasta Recipe
Ingredients:
- 1 lb pasta
- 2 cups marinara sauce
- 1 cup cheese

Instructions:
1. Boil pasta according to package directions
2. Heat sauce in pan
3. Combine and add cheese"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  rows={8}
                  disabled={isImporting}
                />
              ) : (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="https://example.com/recipe or paste recipe text..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isImporting}
                />
              )}
              {input && !isTextMode && isValidUrl(input) && (
                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isTextMode 
                ? 'Paste recipe content from social media posts, videos, or any text source'
                : 'Paste a recipe URL or switch to text mode for social media recipes'
              }
            </p>
          </div>

          {/* Mode Indicator */}
          {input.trim() && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
              isTextMode 
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              {isTextMode ? (
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <Link className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
              <span className={`text-sm ${
                isTextMode 
                  ? 'text-purple-700 dark:text-purple-300' 
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {isTextMode 
                  ? 'Text mode: AI will extract recipe data' 
                  : 'URL mode: Will scrape recipe website'
                }
              </span>
            </div>
          )}

          {/* Confidence Score */}
          {confidence !== null && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Extraction confidence: {confidence}%
              </span>
            </div>
          )}

          {/* Popular Sources */}
          {!isTextMode && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Supported Websites
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
          )}

          {/* Social Media Examples */}
          {isTextMode && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Perfect for Social Media
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Facebook Videos',
                  'Instagram Posts',
                  'TikTok Recipes',
                  'YouTube Comments',
                  'Recipe Screenshots',
                  'Text Messages',
                ].map((source) => (
                  <div
                    key={source}
                    className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 text-center"
                  >
                    {source}
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                {errorMessage}
              </div>
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
                {isTextMode ? 'Extracting...' : 'Importing...'}
              </>
            ) : (
              <>
                {isTextMode && <Sparkles className="w-4 h-4 mr-2" />}
                Import Recipe
              </>
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
