import { supabase } from '../lib/supabase';
import type { 
  MealPlan, 
  PlannedMeal, 
  CreateMealPlanData, 
  MealPlanTemplate,
  DayOfWeek,
  MealType 
} from '../types';

export class MealPlanService {
  // Helper to convert day name to integer (0=Monday, 6=Sunday)
  private dayToInt(day: DayOfWeek): number {
    const dayMap: Record<DayOfWeek, number> = {
      'monday': 0,
      'tuesday': 1,
      'wednesday': 2,
      'thursday': 3,
      'friday': 4,
      'saturday': 5,
      'sunday': 6,
    };
    return dayMap[day];
  }

  // Helper to convert integer to day name
  private intToDay(dayInt: number): DayOfWeek {
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days[dayInt];
  }

  // Create a new meal plan
  async createMealPlan(data: CreateMealPlanData): Promise<MealPlan> {
    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .insert({
        owner_id: data.owner_id,
        plan_name: data.plan_name,
        start_date: data.start_date,
        grocery_list: [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create meal plan: ${error.message}`);
    }

    return mealPlan;
  }

  // Get all meal plans for the current user
  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    const { data: mealPlans, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        planned_meals (
          *,
          recipe:recipes (*)
        )
      `)
      .eq('owner_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch meal plans: ${error.message}`);
    }

    return mealPlans || [];
  }

  // Get a single meal plan by ID
  async getMealPlan(id: string): Promise<MealPlan> {
    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        planned_meals (
          *,
          recipe:recipes (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch meal plan: ${error.message}`);
    }

    return mealPlan;
  }

  // Get meal plan for a specific week
  async getMealPlanForWeek(userId: string, startDate: string): Promise<MealPlan | null> {
    const { data: mealPlans, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        planned_meals (
          *,
          recipe:recipes (*)
        )
      `)
      .eq('owner_id', userId)
      .eq('start_date', startDate)
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch meal plan for week: ${error.message}`);
    }

    return mealPlans?.[0] || null;
  }

  // Add a meal to a meal plan
  async addMealToPlan(
    mealPlanId: string, 
    recipeId: string, 
    dayOfWeek: DayOfWeek, 
    mealType: MealType
  ): Promise<PlannedMeal> {
    const { data: plannedMeal, error } = await supabase
      .from('planned_meals')
      .insert({
        meal_plan_id: mealPlanId,
        recipe_id: recipeId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
      })
      .select(`
        *,
        recipe:recipes (*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to add meal to plan: ${error.message}`);
    }

    return plannedMeal;
  }

  // Remove a meal from a meal plan
  async removeMealFromPlan(plannedMealId: string): Promise<void> {
    const { error } = await supabase
      .from('planned_meals')
      .delete()
      .eq('id', plannedMealId);

    if (error) {
      throw new Error(`Failed to remove meal from plan: ${error.message}`);
    }
  }

  // Move a meal to a different day/meal type
  async moveMeal(
    plannedMealId: string, 
    newDayOfWeek: DayOfWeek, 
    newMealType: MealType
  ): Promise<PlannedMeal> {
    const { data: plannedMeal, error } = await supabase
      .from('planned_meals')
      .update({
        day_of_week: newDayOfWeek,
        meal_type: newMealType,
      })
      .eq('id', plannedMealId)
      .select(`
        *,
        recipe:recipes (*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to move meal: ${error.message}`);
    }

    return plannedMeal;
  }

  // Update meal plan name
  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan> {
    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update meal plan: ${error.message}`);
    }

    return mealPlan;
  }

  // Delete a meal plan
  async deleteMealPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete meal plan: ${error.message}`);
    }
  }

  // Copy meal plan from another week
  async copyMealPlan(
    sourceMealPlanId: string, 
    newPlanName: string, 
    newStartDate: string, 
    userId: string
  ): Promise<MealPlan> {
    // Get the source meal plan
    const sourcePlan = await this.getMealPlan(sourceMealPlanId);
    
    // Create new meal plan
    const newPlan = await this.createMealPlan({
      plan_name: newPlanName,
      start_date: newStartDate,
      owner_id: userId,
    });

    // Copy all planned meals
    if (sourcePlan.planned_meals) {
      for (const meal of sourcePlan.planned_meals) {
        await this.addMealToPlan(
          newPlan.id,
          meal.recipe_id,
          meal.day_of_week,
          meal.meal_type
        );
      }
    }

    return newPlan;
  }

  // Generate grocery list from meal plan
  async generateGroceryList(mealPlanId: string): Promise<void> {
    // This will be handled by the database trigger function
    // But we can also implement client-side logic if needed
    const mealPlan = await this.getMealPlan(mealPlanId);
    
    if (!mealPlan.planned_meals) return;

    const groceryItems: any[] = [];
    
    for (const plannedMeal of mealPlan.planned_meals) {
      if (plannedMeal.recipe?.ingredients) {
        for (const ingredient of plannedMeal.recipe.ingredients) {
          groceryItems.push({
            item: ingredient.name,
            quantity: ingredient.amount,
            category: 'Other', // We can categorize this later
            checked: false,
            notes: ingredient.notes || '',
          });
        }
      }
    }

    // Update the meal plan with the grocery list
    await this.updateMealPlan(mealPlanId, {
      grocery_list: groceryItems,
    });
  }

  // Get meal plan templates
  async getMealPlanTemplates(): Promise<MealPlanTemplate[]> {
    // For now, return built-in templates
    // Later we can store these in the database
    return [
      {
        id: 'quick-weeknight',
        name: 'Quick Weeknight Meals',
        description: 'Fast and easy meals for busy weeknights',
        template_type: 'system',
        meals: [
          { day_of_week: 'monday', meal_type: 'dinner', recipe_name: 'Quick Pasta' },
          { day_of_week: 'tuesday', meal_type: 'dinner', recipe_name: 'Stir Fry' },
          { day_of_week: 'wednesday', meal_type: 'dinner', recipe_name: 'Tacos' },
          { day_of_week: 'thursday', meal_type: 'dinner', recipe_name: 'Grilled Chicken' },
          { day_of_week: 'friday', meal_type: 'dinner', recipe_name: 'Pizza Night' },
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: 'kids-favorites',
        name: 'Kids Favorites',
        description: 'Kid-friendly meals the whole family will love',
        template_type: 'system',
        meals: [
          { day_of_week: 'monday', meal_type: 'dinner', recipe_name: 'Mac and Cheese' },
          { day_of_week: 'tuesday', meal_type: 'dinner', recipe_name: 'Chicken Nuggets' },
          { day_of_week: 'wednesday', meal_type: 'dinner', recipe_name: 'Spaghetti' },
          { day_of_week: 'thursday', meal_type: 'dinner', recipe_name: 'Grilled Cheese' },
          { day_of_week: 'friday', meal_type: 'dinner', recipe_name: 'Hot Dogs' },
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: 'healthy-week',
        name: 'Healthy Week',
        description: 'Nutritious and balanced meals',
        template_type: 'system',
        meals: [
          { day_of_week: 'monday', meal_type: 'dinner', recipe_name: 'Salmon with Vegetables' },
          { day_of_week: 'tuesday', meal_type: 'dinner', recipe_name: 'Quinoa Bowl' },
          { day_of_week: 'wednesday', meal_type: 'dinner', recipe_name: 'Chicken Salad' },
          { day_of_week: 'thursday', meal_type: 'dinner', recipe_name: 'Vegetable Curry' },
          { day_of_week: 'friday', meal_type: 'dinner', recipe_name: 'Lean Beef Stir Fry' },
        ],
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Helper function to get the start of week (Monday) for a given date
  getWeekStart(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  // Helper function to get current week's meal plan
  async getCurrentWeekMealPlan(userId: string): Promise<MealPlan | null> {
    const weekStart = this.getWeekStart(new Date());
    return this.getMealPlanForWeek(userId, weekStart);
  }

  // Helper function to get or create current week's meal plan
  async getOrCreateCurrentWeekMealPlan(userId: string): Promise<MealPlan> {
    const weekStart = this.getWeekStart(new Date());
    let mealPlan = await this.getMealPlanForWeek(userId, weekStart);
    
    if (!mealPlan) {
      mealPlan = await this.createMealPlan({
        plan_name: `Week of ${new Date(weekStart).toLocaleDateString()}`,
        start_date: weekStart,
        owner_id: userId,
      });
    }
    
    return mealPlan;
  }
}

export const mealPlanService = new MealPlanService();
