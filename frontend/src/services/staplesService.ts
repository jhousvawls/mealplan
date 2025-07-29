import { supabase } from '../lib/supabase';
import type { HouseholdStaple, StapleUsageHistory, StapleSuggestion } from '../types';

export class StaplesService {
  // Helper to check if we're using dummy user
  private isDummyUser(userId: string): boolean {
    return userId === 'dummy-user-123';
  }

  // Mock staples for dummy user (based on user's breakfast preferences)
  private getMockStaples(): HouseholdStaple[] {
    return [
      // Breakfast staples
      { id: 'staple-1', household_id: 'dummy-household', item_name: 'Eggs', category: 'dairy', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-2', household_id: 'dummy-household', item_name: 'Cereal', category: 'pantry', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-3', household_id: 'dummy-household', item_name: 'Bagels', category: 'bakery', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-4', household_id: 'dummy-household', item_name: 'Frozen Waffles', category: 'frozen', frequency: 'biweekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-5', household_id: 'dummy-household', item_name: 'Orange Juice', category: 'dairy', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-6', household_id: 'dummy-household', item_name: 'Coffee', category: 'pantry', frequency: 'biweekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // Common household staples
      { id: 'staple-7', household_id: 'dummy-household', item_name: 'Milk', category: 'dairy', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-8', household_id: 'dummy-household', item_name: 'Bread', category: 'bakery', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-9', household_id: 'dummy-household', item_name: 'Bananas', category: 'produce', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'staple-10', household_id: 'dummy-household', item_name: 'Chicken Breast', category: 'meat', frequency: 'weekly', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  }

  // Get all household staples
  async getHouseholdStaples(householdId: string): Promise<HouseholdStaple[]> {
    // Return mock data for dummy user
    if (householdId === 'dummy-household') {
      return this.getMockStaples();
    }

    const { data: staples, error } = await supabase
      .from('household_staples')
      .select('*')
      .eq('household_id', householdId)
      .eq('is_active', true)
      .order('item_name');

    if (error) {
      throw new Error(`Failed to fetch household staples: ${error.message}`);
    }

    return staples || [];
  }

  // Create a new household staple
  async createStaple(staple: Omit<HouseholdStaple, 'id' | 'created_at' | 'updated_at'>): Promise<HouseholdStaple> {
    const { data: newStaple, error } = await supabase
      .from('household_staples')
      .insert(staple)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create staple: ${error.message}`);
    }

    return newStaple;
  }

  // Update a household staple
  async updateStaple(id: string, updates: Partial<HouseholdStaple>): Promise<HouseholdStaple> {
    const { data: updatedStaple, error } = await supabase
      .from('household_staples')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update staple: ${error.message}`);
    }

    return updatedStaple;
  }

  // Delete (deactivate) a household staple
  async deleteStaple(id: string): Promise<void> {
    const { error } = await supabase
      .from('household_staples')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete staple: ${error.message}`);
    }
  }

  // Get staple suggestions for a meal plan
  async getStapleSuggestions(householdId: string, mealPlanId: string): Promise<StapleSuggestion[]> {
    // For dummy user, return mock suggestions
    if (householdId === 'dummy-household') {
      const mockStaples = this.getMockStaples();
      return mockStaples.map(staple => ({
        staple,
        suggested: true,
        reason: staple.frequency === 'weekly' ? 'weekly_due' : 'biweekly_due',
        days_since_last_purchase: staple.frequency === 'weekly' ? 7 : 14
      }));
    }

    // Get all active staples
    const staples = await this.getHouseholdStaples(householdId);
    
    // Get usage history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usageHistory, error } = await supabase
      .from('staples_usage_history')
      .select(`
        *,
        household_staple:household_staples(*)
      `)
      .in('household_staple_id', staples.map(s => s.id))
      .gte('added_to_list_at', thirtyDaysAgo.toISOString());

    if (error) {
      throw new Error(`Failed to fetch usage history: ${error.message}`);
    }

    // Generate suggestions based on frequency and last usage
    const suggestions: StapleSuggestion[] = [];
    
    for (const staple of staples) {
      const lastUsage = usageHistory
        ?.filter(h => h.household_staple_id === staple.id)
        ?.sort((a, b) => new Date(b.added_to_list_at).getTime() - new Date(a.added_to_list_at).getTime())[0];

      const daysSinceLastUsage = lastUsage 
        ? Math.floor((Date.now() - new Date(lastUsage.added_to_list_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30; // Assume 30 days if never used

      let suggested = false;
      let reason = '';

      // Suggest based on frequency
      if (staple.frequency === 'weekly' && daysSinceLastUsage >= 7) {
        suggested = true;
        reason = 'weekly_due';
      } else if (staple.frequency === 'biweekly' && daysSinceLastUsage >= 14) {
        suggested = true;
        reason = 'biweekly_due';
      } else if (staple.frequency === 'monthly' && daysSinceLastUsage >= 30) {
        suggested = true;
        reason = 'monthly_due';
      } else if (daysSinceLastUsage >= 21) {
        suggested = true;
        reason = 'not_purchased_recently';
      }

      suggestions.push({
        staple,
        suggested,
        reason,
        last_purchased: lastUsage?.added_to_list_at,
        days_since_last_purchase: daysSinceLastUsage
      });
    }

    return suggestions;
  }

  // Add staples to a meal plan's grocery list
  async addStaplesToGroceryList(
    mealPlanId: string, 
    stapleIds: string[], 
    quantities: Record<string, string> = {}
  ): Promise<void> {
    // Record usage history
    const usageRecords = stapleIds.map(stapleId => ({
      household_staple_id: stapleId,
      meal_plan_id: mealPlanId,
      quantity: quantities[stapleId] || null
    }));

    const { error } = await supabase
      .from('staples_usage_history')
      .insert(usageRecords);

    if (error) {
      throw new Error(`Failed to record staple usage: ${error.message}`);
    }
  }

  // Mark staples as purchased
  async markStaplesPurchased(usageHistoryIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('staples_usage_history')
      .update({ 
        was_purchased: true, 
        purchased_at: new Date().toISOString() 
      })
      .in('id', usageHistoryIds);

    if (error) {
      throw new Error(`Failed to mark staples as purchased: ${error.message}`);
    }
  }

  // Setup default staples for a new household
  async setupDefaultStaples(householdId: string): Promise<HouseholdStaple[]> {
    const defaultStaples = [
      // Breakfast staples
      { household_id: householdId, item_name: 'Eggs', category: 'dairy', frequency: 'weekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Milk', category: 'dairy', frequency: 'weekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Bread', category: 'bakery', frequency: 'weekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Cereal', category: 'pantry', frequency: 'biweekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Orange Juice', category: 'dairy', frequency: 'weekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Coffee', category: 'pantry', frequency: 'biweekly' as const, is_active: true },
      
      // Common staples
      { household_id: householdId, item_name: 'Bananas', category: 'produce', frequency: 'weekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Chicken Breast', category: 'meat', frequency: 'weekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Ground Beef', category: 'meat', frequency: 'biweekly' as const, is_active: true },
      { household_id: householdId, item_name: 'Rice', category: 'pantry', frequency: 'monthly' as const, is_active: true },
      { household_id: householdId, item_name: 'Pasta', category: 'pantry', frequency: 'monthly' as const, is_active: true },
      { household_id: householdId, item_name: 'Olive Oil', category: 'pantry', frequency: 'monthly' as const, is_active: true },
    ];

    const { data: createdStaples, error } = await supabase
      .from('household_staples')
      .insert(defaultStaples)
      .select();

    if (error) {
      throw new Error(`Failed to setup default staples: ${error.message}`);
    }

    return createdStaples || [];
  }

  // Get staples by category
  async getStaplesByCategory(householdId: string): Promise<Record<string, HouseholdStaple[]>> {
    const staples = await this.getHouseholdStaples(householdId);
    
    return staples.reduce((groups, staple) => {
      const category = staple.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(staple);
      return groups;
    }, {} as Record<string, HouseholdStaple[]>);
  }

  // Bulk update staples (for settings page)
  async bulkUpdateStaples(updates: Array<{ id: string; updates: Partial<HouseholdStaple> }>): Promise<void> {
    const promises = updates.map(({ id, updates: stapleUpdates }) => 
      this.updateStaple(id, stapleUpdates)
    );

    await Promise.all(promises);
  }
}

export const staplesService = new StaplesService();
