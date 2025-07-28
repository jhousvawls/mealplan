import React, { useState } from 'react';
import { Plus, Search, Filter, Link2, Grid, List, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useRecipes, useDeleteRecipe } from '../../../hooks/useRecipesQuery';
import { RecipeImportModal } from './RecipeImportModal';
import Button from '../../ui/Button';
import type { Recipe, CUISINE_TYPES, RECIPE_CATEGORIES } from '../../../types';

export const RecipeBox: React.FC = () => {
  const { data: recipes = [], isLoading, error } = useRecipes();
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');

  const cuisines = ['Italian', 'Mexican', 'Asian', 'Grill', 'American', 'Mediterranean'];

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ing: any) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCuisine = !selectedCuisine || recipe.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const handleImportSuccess = (recipe: Recipe) => {
    console.log('Recipe imported successfully:', recipe);
    // The useRecipes hook will automatically update the recipes list
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recipe Box
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {recipes.length} recipes saved
          </p>
        </div>
        <Button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2"
        >
          <Link2 className="w-4 h-4" />
          <span>Import Recipe</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Cuisine Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="">All Cuisines</option>
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recipes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Link2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recipes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building your recipe collection by importing from your favorite food blogs
          </p>
          <Button onClick={() => setShowImportModal(true)}>
            <Link2 className="w-4 h-4 mr-2" />
            Import Your First Recipe
          </Button>
        </div>
      )}

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && recipes.length > 0 && filteredRecipes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            No recipes match your search criteria
          </p>
        </div>
      )}

      {/* Import Modal */}
      <RecipeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

// Recipe Card Component
interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Recipe Image */}
      <div className="h-48 relative overflow-hidden">
        {recipe.featured_image && !imageError ? (
          <img
            src={recipe.featured_image}
            alt={recipe.image_alt_text || recipe.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recipe.cuisine || 'Recipe'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {recipe.name}
          </h3>
          {recipe.source_url && (
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Recipe Meta */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          {recipe.prep_time && (
            <span>⏱️ {recipe.prep_time}</span>
          )}
          {recipe.cuisine && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {recipe.cuisine}
            </span>
          )}
        </div>

        {/* Ingredients Preview */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {recipe.ingredients.length} ingredients
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
              <span
                key={index}
                className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
              >
                {ingredient.name}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{recipe.ingredients.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Recipe
          </Button>
          <Button variant="ghost" size="sm">
            ⋯
          </Button>
        </div>
      </div>
    </div>
  );
};
