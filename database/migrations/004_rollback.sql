-- Rollback script for Migration 004
-- Use this script to undo the changes made by migration 004 if needed

-- ============================================================================
-- ROLLBACK MIGRATION 004
-- ============================================================================

-- Drop the enhanced trigger and function
DROP TRIGGER IF EXISTS trigger_update_grocery_list_with_staples ON planned_meals;
DROP FUNCTION IF EXISTS update_meal_plan_grocery_list_with_staples();
DROP FUNCTION IF EXISTS mark_staples_added_to_list(UUID);
DROP FUNCTION IF EXISTS generate_grocery_list_with_staples(UUID);

-- Restore original trigger and function
CREATE OR REPLACE FUNCTION update_meal_plan_grocery_list()
RETURNS TRIGGER AS $$
BEGIN
    -- Update grocery list when planned meals change
    IF TG_OP = 'DELETE' THEN
        UPDATE meal_plans
        SET grocery_list = generate_grocery_list(OLD.meal_plan_id),
            updated_at = NOW()
        WHERE id = OLD.meal_plan_id;
        RETURN OLD;
    ELSE
        UPDATE meal_plans
        SET grocery_list = generate_grocery_list(NEW.meal_plan_id),
            updated_at = NOW()
        WHERE id = NEW.meal_plan_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_grocery_list
    AFTER INSERT OR UPDATE OR DELETE ON planned_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_plan_grocery_list();

-- Restore original generate_grocery_list function
CREATE OR REPLACE FUNCTION generate_grocery_list(plan_id UUID)
RETURNS JSONB AS $$
DECLARE
    grocery_items JSONB := '[]';
    ingredient JSONB;
    recipe_ingredients JSONB;
BEGIN
    -- Aggregate all ingredients from planned meals
    FOR recipe_ingredients IN
        SELECT r.ingredients
        FROM planned_meals pm
        JOIN recipes r ON pm.recipe_id = r.id
        WHERE pm.meal_plan_id = plan_id
    LOOP
        -- Process each ingredient in the recipe
        FOR ingredient IN SELECT * FROM jsonb_array_elements(recipe_ingredients)
        LOOP
            grocery_items := grocery_items || jsonb_build_array(
                jsonb_build_object(
                    'item', ingredient->>'name',
                    'quantity', ingredient->>'amount',
                    'category', COALESCE(ingredient->>'category', 'Other'),
                    'checked', false,
                    'notes', COALESCE(ingredient->>'notes', '')
                )
            );
        END LOOP;
    END LOOP;
    
    RETURN grocery_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their household's staples" ON household_staples;
DROP POLICY IF EXISTS "Users can insert staples for their household" ON household_staples;
DROP POLICY IF EXISTS "Users can update their household's staples" ON household_staples;
DROP POLICY IF EXISTS "Users can delete their household's staples" ON household_staples;
DROP POLICY IF EXISTS "Users can view their household's staples usage" ON staples_usage_history;
DROP POLICY IF EXISTS "Users can insert staples usage for their household" ON staples_usage_history;
DROP POLICY IF EXISTS "Users can update staples usage for their household" ON staples_usage_history;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS update_household_staples_updated_at ON household_staples;
DROP FUNCTION IF EXISTS update_household_staples_updated_at();

-- Drop tables
DROP TABLE IF EXISTS staples_usage_history;
DROP TABLE IF EXISTS household_staples;

-- Remove columns from meal_plans
ALTER TABLE meal_plans DROP COLUMN IF EXISTS staples_included;
ALTER TABLE meal_plans DROP COLUMN IF EXISTS staples_reviewed_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_household_staples_household_id;
DROP INDEX IF EXISTS idx_household_staples_active;
DROP INDEX IF EXISTS idx_household_staples_category;
DROP INDEX IF EXISTS idx_household_staples_frequency;
DROP INDEX IF EXISTS idx_staples_usage_history_staple_id;
DROP INDEX IF EXISTS idx_staples_usage_history_meal_plan;
DROP INDEX IF EXISTS idx_staples_usage_history_date;
DROP INDEX IF EXISTS idx_meal_plans_staples;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '=== Migration 004 Rollback Completed ===';
    RAISE NOTICE 'All household staples changes have been reverted';
    RAISE NOTICE 'Database restored to pre-migration 004 state';
END $$;
