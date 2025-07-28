import React, { useState } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import Button from '../../ui/Button';
import type { RecipeImage } from '../../../types';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl?: string, altText?: string) => void;
  recipeName: string;
  availableImages: RecipeImage[];
}

export const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  recipeName,
  availableImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<RecipeImage | null>(
    availableImages.length > 0 ? availableImages[0] : null
  );
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl));
  };

  const handleImageSelect = (image: RecipeImage | null) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onImageSelect(selectedImage.url, selectedImage.alt_text);
    } else {
      onImageSelect(); // No image selected
    }
  };

  const getImageTypeLabel = (type: string) => {
    switch (type) {
      case 'hero': return 'Main Photo';
      case 'step': return 'Cooking Step';
      case 'ingredient': return 'Ingredients';
      case 'gallery': return 'Gallery';
      default: return 'Photo';
    }
  };

  const getQualityBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 90) return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">HD</span>;
    if (score >= 80) return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Good</span>;
    return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">OK</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Recipe Image
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select an image for "{recipeName}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {availableImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No images found for this recipe
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* No Image Option */}
              <div
                onClick={() => handleImageSelect(null)}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedImage === null
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      No Image
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use default placeholder
                    </p>
                  </div>
                  {selectedImage === null && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Images */}
              {availableImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageSelect(image)}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedImage === image
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {!imageLoadErrors.has(image.url) ? (
                        <img
                          src={image.url}
                          alt={image.alt_text || 'Recipe image'}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(image.url)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {getImageTypeLabel(image.type)}
                        </h3>
                        {getQualityBadge(image.quality_score)}
                      </div>
                      {image.alt_text && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {image.alt_text}
                        </p>
                      )}
                      {image.dimensions && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {image.dimensions.width} × {image.dimensions.height}
                        </p>
                      )}
                    </div>
                    {selectedImage === image && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
          >
            Use Selected Image
          </Button>
        </div>
      </div>
    </div>
  );
};
