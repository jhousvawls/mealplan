import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../../contexts/AuthContext';

interface FavoriteButtonProps {
  recipeId: string;
  isFavorite?: boolean;
  onToggle?: (recipeId: string, isFavorite: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({
  recipeId,
  isFavorite = false,
  onToggle,
  size = 'md',
  className = '',
  showLabel = false
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const handleToggle = async () => {
    if (!user || isLoading) return;

    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    setIsLoading(true);
    const newFavoriteState = !localIsFavorite;

    try {
      // Optimistic update
      setLocalIsFavorite(newFavoriteState);

      // Call the parent's toggle handler
      await onToggle?.(recipeId, newFavoriteState);

      // TODO: Add actual API call to update favorites in Supabase
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      // Revert optimistic update on error
      setLocalIsFavorite(!newFavoriteState);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show favorite button if user is not logged in
  }

  const HeartComponent = localIsFavorite ? HeartSolidIcon : HeartIcon;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        ${className}
        inline-flex items-center space-x-1
        text-gray-400 hover:text-red-500
        ${localIsFavorite ? 'text-red-500' : ''}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-200 ease-in-out
        hover:scale-110 active:scale-95
        rounded-full hover:bg-red-50
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      `}
      title={localIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={localIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartComponent 
        className={`
          ${sizeClasses[size]}
          transition-all duration-200 ease-in-out
          ${isLoading ? 'animate-pulse' : ''}
          ${localIsFavorite ? 'text-red-500 drop-shadow-sm' : 'text-gray-400'}
        `}
      />
      {showLabel && (
        <span className={`
          text-sm font-medium
          ${localIsFavorite ? 'text-red-500' : 'text-gray-600'}
          ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}
        `}>
          {localIsFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}

// Utility hook for managing favorites (to be used by parent components)
export function useFavoriteToggle() {
  const { user } = useAuth();

  const toggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    if (!user) return;

    try {
      // TODO: Implement actual Supabase API calls
      if (isFavorite) {
        // Add to favorites
        console.log(`Adding recipe ${recipeId} to favorites for user ${user.id}`);
        // await supabase.from('household_preferences').insert({
        //   user_id: user.id,
        //   recipe_id: recipeId,
        //   preference_type: 'favorite',
        //   preference_value: true
        // });
      } else {
        // Remove from favorites
        console.log(`Removing recipe ${recipeId} from favorites for user ${user.id}`);
        // await supabase.from('household_preferences')
        //   .delete()
        //   .eq('user_id', user.id)
        //   .eq('recipe_id', recipeId)
        //   .eq('preference_type', 'favorite');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  return { toggleFavorite };
}

// Utility component for displaying favorite status in lists
export function FavoriteIndicator({ 
  isFavorite, 
  size = 'sm',
  className = '' 
}: { 
  isFavorite: boolean; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!isFavorite) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <HeartSolidIcon 
      className={`
        ${sizeClasses[size]}
        ${className}
        text-red-500 drop-shadow-sm
      `}
      title="Favorite recipe"
    />
  );
}
