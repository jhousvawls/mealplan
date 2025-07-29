import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusIcon, TrashIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { useCreateRecipe } from '../../../hooks/useRecipesQuery';
import Button from '../../ui/Button';
import type { CreateRecipeData, Ingredient } from '../../../types';

interface ManualRecipeFormProps {
  onSuccess?: (recipe: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateRecipeData>;
  className?: string;
}

interface FormData {
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  prep_time: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time_category: 'quick' | 'medium' | 'long';
  tags: string;
  dietary_restrictions: string[];
  featured_image: string;
  image_alt_text: string;
}

const CUISINE_OPTIONS = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai',
  'French', 'Mediterranean', 'Greek', 'Korean', 'Vietnamese', 'Spanish',
  'Middle Eastern', 'German', 'British', 'Brazilian', 'Moroccan', 'Other'
];

const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
  'egg-free', 'soy-free', 'keto', 'paleo', 'low-carb', 'low-fat',
  'low-sodium', 'diabetic-friendly', 'heart-healthy'
];

export function ManualRecipeForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  className = '' 
}: ManualRecipeFormProps) {
  const { user } = useAuth();
  const createRecipeMutation = useCreateRecipe();
  const [imagePreview, setImagePreview] = useState<string>(initialData?.featured_image || '');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      ingredients: initialData?.ingredients || [{ name: '', amount: '', unit: '', notes: '' }],
      instructions: initialData?.instructions || '',
      prep_time: initialData?.prep_time || '',
      cuisine: initialData?.cuisine || '',
      difficulty: initialData?.difficulty || 'medium',
      prep_time_category: initialData?.prep_time_category || 'medium',
      tags: initialData?.tags?.join(', ') || '',
      dietary_restrictions: initialData?.dietary_restrictions || [],
      featured_image: initialData?.featured_image || '',
      image_alt_text: initialData?.image_alt_text || '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const watchedDietaryRestrictions = watch('dietary_restrictions');

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      const recipeData: CreateRecipeData = {
        name: data.name.trim(),
        ingredients: data.ingredients.filter(ing => ing.name.trim() !== ''),
        instructions: data.instructions.trim(),
        prep_time: data.prep_time.trim() || undefined,
        cuisine: data.cuisine || undefined,
        difficulty: data.difficulty,
        prep_time_category: data.prep_time_category,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        dietary_restrictions: data.dietary_restrictions,
        featured_image: data.featured_image.trim() || undefined,
        image_alt_text: data.image_alt_text.trim() || undefined,
        owner_id: user.id,
        is_draft: false,
      };

      const recipe = await createRecipeMutation.mutateAsync(recipeData);
      onSuccess?.(recipe);
    } catch (error) {
      console.error('Failed to create recipe:', error);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setValue('featured_image', url);
    setImagePreview(url);
  };

  const addIngredient = () => {
    append({ name: '', amount: '', unit: '', notes: '' });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = watchedDietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    setValue('dietary_restrictions', updated);
  };

  return (
    <div className={`manual-recipe-form ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {initialData ? 'Edit Recipe' : 'Create New Recipe'}
          </h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-hover)] transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Desktop: Two-column layout, Mobile: Single column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Basic Info */}
          <div className="space-y-6">
            {/* Recipe Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Recipe Name *
              </label>
              <input
                {...register('name', { required: 'Recipe name is required' })}
                type="text"
                className="input"
                placeholder="Enter recipe name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-[var(--red)]">{errors.name.message}</p>
              )}
            </div>

            {/* Recipe Image */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Recipe Image
              </label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setImagePreview('')}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setValue('featured_image', '');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <input
                  {...register('featured_image')}
                  type="url"
                  className="input"
                  placeholder="Enter image URL"
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                />
                <input
                  {...register('image_alt_text')}
                  type="text"
                  className="input"
                  placeholder="Image description (optional)"
                />
              </div>
            </div>

            {/* Recipe Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prep_time" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Prep Time
                </label>
                <input
                  {...register('prep_time')}
                  type="text"
                  className="input"
                  placeholder="e.g., 30 minutes"
                />
              </div>

              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Cuisine
                </label>
                <select
                  {...register('cuisine')}
                  className="input"
                >
                  <option value="">Select cuisine</option>
                  {CUISINE_OPTIONS.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Difficulty
                </label>
                <select
                  {...register('difficulty')}
                  className="input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="prep_time_category" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Time Category
                </label>
                <select
                  {...register('prep_time_category')}
                  className="input"
                >
                  <option value="quick">Quick (&lt; 30 min)</option>
                  <option value="medium">Medium (30-60 min)</option>
                  <option value="long">Long (&gt; 60 min)</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input"
                placeholder="e.g., comfort food, quick, healthy (comma separated)"
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Separate tags with commas</p>
            </div>
          </div>

          {/* Right Column: Ingredients & Instructions */}
          <div className="space-y-6">
            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Ingredients *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        {...register(`ingredients.${index}.name` as const, {
                          required: index === 0 ? 'At least one ingredient is required' : false
                        })}
                        type="text"
                        className="input text-sm"
                        placeholder="Ingredient name"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        {...register(`ingredients.${index}.amount` as const)}
                        type="text"
                        className="input text-sm"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="w-16">
                      <input
                        {...register(`ingredients.${index}.unit` as const)}
                        type="text"
                        className="input text-sm"
                        placeholder="Unit"
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-[var(--red)] hover:text-red-700 hover:bg-[var(--red)] hover:bg-opacity-10 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.ingredients?.[0]?.name && (
                <p className="mt-1 text-sm text-[var(--red)]">{errors.ingredients[0].name.message}</p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Instructions *
              </label>
              <textarea
                {...register('instructions', { required: 'Instructions are required' })}
                rows={8}
                className="input resize-none"
                placeholder="Enter step-by-step cooking instructions..."
              />
              {errors.instructions && (
                <p className="mt-1 text-sm text-[var(--red)]">{errors.instructions.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Dietary Restrictions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {DIETARY_RESTRICTIONS.map(restriction => (
              <label
                key={restriction}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={watchedDietaryRestrictions?.includes(restriction) || false}
                  onChange={() => toggleDietaryRestriction(restriction)}
                  className="rounded border-[var(--border)] text-[var(--blue)] focus:ring-[var(--blue)]"
                />
                <span className="text-sm text-[var(--text-primary)] capitalize">
                  {restriction.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-[var(--border)]">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Creating Recipe...' : 'Create Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
}
