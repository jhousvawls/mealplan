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

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  source_url?: string;
  prep_time?: string;
  cuisine?: string;
  estimated_nutrition?: NutritionInfo;
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
