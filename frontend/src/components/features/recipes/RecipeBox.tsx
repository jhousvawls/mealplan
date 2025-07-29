import React, { useState } from 'react';
import { Plus, Search, Filter, Link2, Grid, List, MoreVertical, Edit, Trash2, ChevronDownIcon } from 'lucide-react';
import { useRecipes, useDeleteRecipe } from '../../../hooks/useRecipesQuery';
import { RecipeImportModal } from './RecipeImportModal';
import { ManualRecipeForm } from './ManualRecipeForm';
import { FavoriteButton, useFavoriteToggle } from './FavoriteButton';
import Button from '../../ui/Button';
import type { Recipe, CUISINE_TYPES, RECIPE_CATEGORIES } from '../../../types';

export const RecipeBox: React.FC = () => {
  const { data: recipes = [], isLoading, error } = useRecipes();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
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
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="page-title">
            Recipe Box
          </h1>
          <p className="page-subtitle">
            {recipes.length} recipes saved
          </p>
        </div>
        
        {/* Add Recipe Dropdown */}
        <div className="relative">
          <Button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipe</span>
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
          
          {showAddDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowImportModal(true);
                    setShowAddDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center space-x-2 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Import from URL</span>
                </button>
                <button
                  onClick={() => {
                    setShowManualForm(true);
                    setShowAddDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Create Manually</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Click outside to close dropdown */}
          {showAddDropdown && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowAddDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
          <input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Cuisine Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="input pl-10 pr-8 appearance-none"
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
        <div className="p-4 bg-[var(--red)] bg-opacity-10 border border-[var(--red)] border-opacity-30 rounded-lg">
          <p className="text-[var(--red)]">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recipes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-[var(--bg-hover)] rounded-full flex items-center justify-center">
            <Link2 className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
            No recipes yet
          </h3>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Start building your recipe collection by importing from your favorite food blogs
          </p>
          <Button onClick={() => setShowImportModal(true)} className="btn btn-primary">
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
          <p className="text-[var(--text-secondary)]">
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

      {/* Manual Recipe Form Modal */}
      {showManualForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <ManualRecipeForm
              onSuccess={(recipe) => {
                handleImportSuccess(recipe);
                setShowManualForm(false);
              }}
              onCancel={() => setShowManualForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Recipe Card Component
interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [imageError, setImageError] = useState(false);
  const { toggleFavorite } = useFavoriteToggle();
  
  // For MVP, we'll simulate favorite status (in real app, this would come from user preferences)
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteToggle = async (recipeId: string, newFavoriteState: boolean) => {
    try {
      await toggleFavorite(recipeId, newFavoriteState);
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <div className="card card-hover">
      {/* Recipe Image */}
      <div className="h-48 relative overflow-hidden rounded-t-2xl">
        {recipe.featured_image && !imageError ? (
          <img
            src={recipe.featured_image}
            alt={recipe.image_alt_text || recipe.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-[var(--blue)] from-opacity-10 to-[var(--blue)] to-opacity-20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {recipe.cuisine || 'Recipe'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">
            {recipe.name}
          </h3>
          {recipe.source_url && (
            <Link2 className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Recipe Meta */}
        <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)] mb-3">
          {recipe.prep_time && (
            <span>⏱️ {recipe.prep_time}</span>
          )}
          {recipe.cuisine && (
            <span className="px-2 py-1 bg-[var(--bg-hover)] rounded text-xs">
              {recipe.cuisine}
            </span>
          )}
        </div>

        {/* Ingredients Preview */}
        <div className="mb-3">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            {recipe.ingredients.length} ingredients
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
              <span
                key={index}
                className="text-xs bg-[var(--bg-hover)] text-[var(--text-secondary)] px-2 py-1 rounded"
              >
                {ingredient.name}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="text-xs text-[var(--text-secondary)] opacity-75">
                +{recipe.ingredients.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 flex-1">
            <Button variant="outline" size="sm" className="btn btn-outline flex-1">
              View Recipe
            </Button>
            <Button variant="ghost" size="sm" className="btn btn-ghost">
              ⋯
            </Button>
          </div>
          
          {/* Favorite Button */}
          <div className="ml-2">
            <FavoriteButton
              recipeId={recipe.id}
              isFavorite={isFavorite}
              onToggle={handleFavoriteToggle}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
