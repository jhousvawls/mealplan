// Core types for the meal planning app

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  household_name: string;
  created_at: string;
}

export interface RecipeImage {
  url: string;
  type: 'hero' | 'step' | 'ingredient' | 'gallery';
  alt_text?: string;
  dimensions?: { width: number; height: number };
  quality_score?: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  source_url?: string;
  prep_time?: string;
  cuisine?: string;
  estimated_nutrition?: NutritionInfo;
  featured_image?: string;
  image_alt_text?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  servings?: number;
}

// Recipe creation and update types
export interface CreateRecipeData {
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  source_url?: string;
  prep_time?: string;
  cuisine?: string;
  estimated_nutrition?: NutritionInfo;
  featured_image?: string;
  image_alt_text?: string;
  owner_id: string;
  tags?: string[];
}

export interface UpdateRecipeData {
  name?: string;
  ingredients?: Ingredient[];
  instructions?: string;
  source_url?: string;
  prep_time?: string;
  cuisine?: string;
  estimated_nutrition?: NutritionInfo;
  featured_image?: string;
  image_alt_text?: string;
  tags?: string[];
}

// Recipe filtering and search types
export interface RecipeFilters {
  cuisine?: string;
  tags?: string[];
  prepTime?: string;
  searchQuery?: string;
}

export interface RecipeCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// Predefined recipe categories
export const RECIPE_CATEGORIES: RecipeCategory[] = [
  { id: 'breakfast', name: 'Breakfast', color: 'bg-orange-100 text-orange-800' },
  { id: 'lunch', name: 'Lunch', color: 'bg-green-100 text-green-800' },
  { id: 'dinner', name: 'Dinner', color: 'bg-blue-100 text-blue-800' },
  { id: 'dessert', name: 'Dessert', color: 'bg-pink-100 text-pink-800' },
  { id: 'snack', name: 'Snack', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'appetizer', name: 'Appetizer', color: 'bg-purple-100 text-purple-800' },
  { id: 'quick', name: 'Quick & Easy', color: 'bg-red-100 text-red-800' },
  { id: 'healthy', name: 'Healthy', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'comfort', name: 'Comfort Food', color: 'bg-amber-100 text-amber-800' },
  { id: 'vegetarian', name: 'Vegetarian', color: 'bg-lime-100 text-lime-800' },
  { id: 'vegan', name: 'Vegan', color: 'bg-teal-100 text-teal-800' },
  { id: 'gluten-free', name: 'Gluten Free', color: 'bg-cyan-100 text-cyan-800' },
];

// Cuisine types
export const CUISINE_TYPES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 
  'French', 'Mediterranean', 'Greek', 'Korean', 'Vietnamese', 'Spanish', 
  'Middle Eastern', 'German', 'British', 'Brazilian', 'Moroccan', 'Other'
] as const;

export type CuisineType = typeof CUISINE_TYPES[number];

// Recipe parsing from URL types
export interface ParsedRecipeData {
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  prep_time?: string;
  cuisine?: string;
  nutrition?: NutritionInfo;
}

export interface MealPlan {
  id: string;
  owner_id: string;
  plan_name: string;
  start_date: string;
  grocery_list: GroceryItem[];
  planned_meals?: PlannedMeal[];
  created_at: string;
  updated_at: string;
}

export interface PlannedMeal {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe?: Recipe;
  created_at: string;
}

export interface GroceryItem {
  item: string;
  quantity: string;
  category: string;
  checked: boolean;
  notes?: string;
}

export interface MealPlanShare {
  id: string;
  meal_plan_id: string;
  shared_with_user_id: string;
  can_edit: boolean;
  created_at: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// UI Component Props
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Auth types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}
