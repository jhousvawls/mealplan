import type { MealPlan, Recipe, PlannedMeal } from '../types';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Chicken Stir Fry',
    ingredients: [
      { name: 'Chicken Breast', amount: '1 lb', unit: 'pound' },
      { name: 'Bell Peppers', amount: '2', unit: 'pieces' },
      { name: 'Soy Sauce', amount: '3', unit: 'tablespoons' },
      { name: 'Garlic', amount: '3', unit: 'cloves' },
    ],
    instructions: '1. Cut chicken into strips\n2. Heat oil in wok\n3. Cook chicken until done\n4. Add vegetables and sauce\n5. Stir fry for 5 minutes',
    prep_time: '20 minutes',
    cuisine: 'Asian',
    estimated_nutrition: {
      calories: 380,
      protein: '35g',
      carbs: '8g',
      fat: '22g',
      fiber: '2g',
      servings: 4,
    },
    owner_id: '1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Vegetarian Pasta Primavera',
    ingredients: [
      { name: 'Pasta', amount: '1 lb', unit: 'pound' },
      { name: 'Cherry Tomatoes', amount: '2 cups', unit: 'cups' },
      { name: 'Fresh Basil', amount: '1/4 cup', unit: 'cup' },
      { name: 'Olive Oil', amount: '3', unit: 'tablespoons' },
    ],
    instructions: '1. Cook pasta according to package directions\n2. Sauté vegetables in olive oil\n3. Combine pasta and vegetables\n4. Add fresh basil and serve',
    prep_time: '25 minutes',
    cuisine: 'Italian',
    estimated_nutrition: {
      calories: 420,
      protein: '15g',
      carbs: '65g',
      fat: '12g',
      fiber: '8g',
      servings: 4,
    },
    owner_id: '1',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Beef Tacos',
    ingredients: [
      { name: 'Ground Beef', amount: '1 lb', unit: 'pound' },
      { name: 'Taco Shells', amount: '8', unit: 'pieces' },
      { name: 'Cheddar Cheese', amount: '1 cup', unit: 'cup' },
      { name: 'Lettuce', amount: '2 cups', unit: 'cups' },
    ],
    instructions: '1. Brown ground beef in skillet\n2. Season with taco seasoning\n3. Warm taco shells\n4. Fill shells with beef and toppings',
    prep_time: '15 minutes',
    cuisine: 'Mexican',
    estimated_nutrition: {
      calories: 485,
      protein: '28g',
      carbs: '22g',
      fat: '32g',
      fiber: '3g',
      servings: 4,
    },
    owner_id: '1',
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
  },
];

export const mockPlannedMeals: PlannedMeal[] = [
  {
    id: '1',
    meal_plan_id: '1',
    recipe_id: '1',
    day_of_week: 'monday',
    meal_type: 'dinner',
    recipe: mockRecipes[0],
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    meal_plan_id: '1',
    recipe_id: '2',
    day_of_week: 'tuesday',
    meal_type: 'dinner',
    recipe: mockRecipes[1],
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    meal_plan_id: '1',
    recipe_id: '3',
    day_of_week: 'wednesday',
    meal_type: 'dinner',
    recipe: mockRecipes[2],
    created_at: '2024-01-20T10:00:00Z',
  },
];

export const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    owner_id: '1',
    plan_name: 'Week of January 21',
    start_date: '2024-01-21',
    grocery_list: [
      { item: 'Chicken Breast', quantity: '1 lb', category: 'Meat', checked: false },
      { item: 'Bell Peppers', quantity: '2 pieces', category: 'Produce', checked: false },
      { item: 'Pasta', quantity: '1 lb', category: 'Pantry', checked: true },
      { item: 'Ground Beef', quantity: '1 lb', category: 'Meat', checked: false },
    ],
    planned_meals: mockPlannedMeals,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    owner_id: '1',
    plan_name: 'Week of January 28',
    start_date: '2024-01-28',
    grocery_list: [],
    planned_meals: [],
    created_at: '2024-01-27T10:00:00Z',
    updated_at: '2024-01-27T10:00:00Z',
  },
  {
    id: '3',
    owner_id: '1',
    plan_name: 'February Meal Prep',
    start_date: '2024-02-04',
    grocery_list: [],
    planned_meals: [],
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
];

// Helper functions for working with mock data
export const getMealPlanById = (id: string): MealPlan | undefined => {
  return mockMealPlans.find(plan => plan.id === id);
};

export const getRecipeById = (id: string): Recipe | undefined => {
  return mockRecipes.find(recipe => recipe.id === id);
};

export const getPlannedMealsForPlan = (planId: string): PlannedMeal[] => {
  return mockPlannedMeals.filter(meal => meal.meal_plan_id === planId);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getWeekDays = (startDate: string): string[] => {
  const date = new Date(startDate);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(date);
    day.setDate(date.getDate() + i);
    days.push(day.toLocaleDateString('en-US', { weekday: 'long' }));
  }
  
  return days;
};
