-- Migration 004: Fix Household Staples Integration
-- This migration corrects the issues in migration 003 and properly integrates
-- household staples with the existing schema structure

-- ============================================================================
-- ROLLBACK MIGRATION 003 (if it was partially applied)
-- ============================================================================

-- Drop tables and policies if they exist from migration 003
DROP POLICY IF EXISTS "Users can view their household's staples" ON household_staples;
DROP POLICY IF EXISTS "Users can insert staples for their household" ON household_staples;
DROP POLICY IF EXISTS "Users can update their household's staples" ON household_staples;
DROP POLICY IF EXISTS "Users can delete their household's staples" ON household_staples;
DROP POLICY IF EXISTS "Users can view their household's staples usage" ON staples_usage_history;
DROP POLICY IF EXISTS "Users can insert staples usage for their household" ON staples_usage_history;

DROP TRIGGER IF EXISTS update_household_staples_updated_at ON household_staples;
DROP FUNCTION IF EXISTS update_household_staples_updated_at();

DROP TABLE IF EXISTS staples_usage_history;
DROP TABLE IF EXISTS household_staples;

-- Remove columns added to meal_plans if they exist
ALTER TABLE meal_plans DROP COLUMN IF EXISTS staples_included;
ALTER TABLE meal_plans DROP COLUMN IF EXISTS staples_reviewed_at;

-- ============================================================================
-- CREATE CORRECTED HOUSEHOLD STAPLES SYSTEM
-- ============================================================================

-- Create household_staples table with proper foreign key relationships
CREATE TABLE household_staples (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'other',
    frequency VARCHAR(50) DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique staple items per household
    UNIQUE(household_id, item_name)
);

-- Create staples_usage_history table to track when staples were added to lists
CREATE TABLE staples_usage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_staple_id UUID NOT NULL REFERENCES household_staples(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    added_to_list_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quantity VARCHAR(100),
    was_purchased BOOLEAN DEFAULT false,
    purchased_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent duplicate entries for same staple in same meal plan
    UNIQUE(household_staple_id, meal_plan_id)
);

-- Add staples tracking columns to meal_plans table
ALTER TABLE meal_plans 
ADD COLUMN IF NOT EXISTS staples_included BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staples_reviewed_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for household_staples
CREATE INDEX idx_household_staples_household_id ON household_staples(household_id);
CREATE INDEX idx_household_staples_active ON household_staples(household_id, is_active) WHERE is_active = true;
CREATE INDEX idx_household_staples_category ON household_staples(category);
CREATE INDEX idx_household_staples_frequency ON household_staples(frequency);

-- Indexes for staples_usage_history
CREATE INDEX idx_staples_usage_history_staple_id ON staples_usage_history(household_staple_id);
CREATE INDEX idx_staples_usage_history_meal_plan ON staples_usage_history(meal_plan_id);
CREATE INDEX idx_staples_usage_history_date ON staples_usage_history(added_to_list_at);

-- Composite index for meal plan staples queries
CREATE INDEX idx_meal_plans_staples ON meal_plans(owner_id, staples_included);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES (CORRECTED)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE household_staples ENABLE ROW LEVEL SECURITY;
ALTER TABLE staples_usage_history ENABLE ROW LEVEL SECURITY;

-- CORRECTED RLS policies for household_staples using actual schema structure
CREATE POLICY "Users can view their household's staples" ON household_staples
    FOR SELECT USING (
        household_id = (
            SELECT household_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert staples for their household" ON household_staples
    FOR INSERT WITH CHECK (
        household_id = (
            SELECT household_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their household's staples" ON household_staples
    FOR UPDATE USING (
        household_id = (
            SELECT household_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their household's staples" ON household_staples
    FOR DELETE USING (
        household_id = (
            SELECT household_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- RLS policies for staples_usage_history
CREATE POLICY "Users can view their household's staples usage" ON staples_usage_history
    FOR SELECT USING (
        household_staple_id IN (
            SELECT id FROM household_staples 
            WHERE household_id = (
                SELECT household_id FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert staples usage for their household" ON staples_usage_history
    FOR INSERT WITH CHECK (
        household_staple_id IN (
            SELECT id FROM household_staples 
            WHERE household_id = (
                SELECT household_id FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update staples usage for their household" ON staples_usage_history
    FOR UPDATE USING (
        household_staple_id IN (
            SELECT id FROM household_staples 
            WHERE household_id = (
                SELECT household_id FROM users 
                WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_household_staples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_household_staples_updated_at
    BEFORE UPDATE ON household_staples
    FOR EACH ROW
    EXECUTE FUNCTION update_household_staples_updated_at();

-- Enhanced grocery list generation function that includes staples
CREATE OR REPLACE FUNCTION generate_grocery_list_with_staples(plan_id UUID)
RETURNS JSONB AS $$
DECLARE
    grocery_items JSONB := '[]';
    ingredient JSONB;
    recipe_ingredients JSONB;
    staple_item RECORD;
    plan_owner_household UUID;
BEGIN
    -- Get the household_id for the meal plan owner
    SELECT u.household_id INTO plan_owner_household
    FROM meal_plans mp
    JOIN users u ON mp.owner_id = u.id
    WHERE mp.id = plan_id;
    
    -- Aggregate all ingredients from planned meals (existing functionality)
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
                    'notes', COALESCE(ingredient->>'notes', ''),
                    'source', 'recipe'
                )
            );
        END LOOP;
    END LOOP;
    
    -- Add household staples if household exists
    IF plan_owner_household IS NOT NULL THEN
        FOR staple_item IN
            SELECT item_name, category, notes
            FROM household_staples
            WHERE household_id = plan_owner_household
            AND is_active = true
            -- Only include staples that haven't been added recently based on frequency
            AND NOT EXISTS (
                SELECT 1 FROM staples_usage_history suh
                WHERE suh.household_staple_id = household_staples.id
                AND suh.added_to_list_at > (
                    CASE household_staples.frequency
                        WHEN 'weekly' THEN NOW() - INTERVAL '7 days'
                        WHEN 'biweekly' THEN NOW() - INTERVAL '14 days'
                        WHEN 'monthly' THEN NOW() - INTERVAL '30 days'
                        ELSE NOW() - INTERVAL '7 days'
                    END
                )
            )
        LOOP
            grocery_items := grocery_items || jsonb_build_array(
                jsonb_build_object(
                    'item', staple_item.item_name,
                    'quantity', '1',
                    'category', staple_item.category,
                    'checked', false,
                    'notes', COALESCE(staple_item.notes, ''),
                    'source', 'staple'
                )
            );
        END LOOP;
    END IF;
    
    RETURN grocery_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark staples as added to grocery list
CREATE OR REPLACE FUNCTION mark_staples_added_to_list(plan_id UUID)
RETURNS void AS $$
DECLARE
    plan_owner_household UUID;
    staple_record RECORD;
BEGIN
    -- Get the household_id for the meal plan owner
    SELECT u.household_id INTO plan_owner_household
    FROM meal_plans mp
    JOIN users u ON mp.owner_id = u.id
    WHERE mp.id = plan_id;
    
    -- Mark staples as added to this meal plan
    IF plan_owner_household IS NOT NULL THEN
        FOR staple_record IN
            SELECT id FROM household_staples
            WHERE household_id = plan_owner_household
            AND is_active = true
        LOOP
            INSERT INTO staples_usage_history (household_staple_id, meal_plan_id)
            VALUES (staple_record.id, plan_id)
            ON CONFLICT (household_staple_id, meal_plan_id) DO NOTHING;
        END LOOP;
        
        -- Update meal plan to mark staples as included
        UPDATE meal_plans
        SET staples_included = true,
            staples_reviewed_at = NOW()
        WHERE id = plan_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing grocery list generation trigger to use new function
DROP TRIGGER IF EXISTS trigger_update_grocery_list ON planned_meals;

CREATE OR REPLACE FUNCTION update_meal_plan_grocery_list_with_staples()
RETURNS TRIGGER AS $$
BEGIN
    -- Update grocery list when planned meals change
    IF TG_OP = 'DELETE' THEN
        UPDATE meal_plans
        SET grocery_list = generate_grocery_list_with_staples(OLD.meal_plan_id),
            updated_at = NOW()
        WHERE id = OLD.meal_plan_id;
        RETURN OLD;
    ELSE
        UPDATE meal_plans
        SET grocery_list = generate_grocery_list_with_staples(NEW.meal_plan_id),
            updated_at = NOW()
        WHERE id = NEW.meal_plan_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated trigger
CREATE TRIGGER trigger_update_grocery_list_with_staples
    AFTER INSERT OR UPDATE OR DELETE ON planned_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_plan_grocery_list_with_staples();

-- ============================================================================
-- DATA VALIDATION AND CONSTRAINTS
-- ============================================================================

-- Add check constraints for data integrity
ALTER TABLE household_staples 
ADD CONSTRAINT check_item_name_not_empty CHECK (LENGTH(TRIM(item_name)) > 0);

ALTER TABLE household_staples 
ADD CONSTRAINT check_category_valid CHECK (category IN ('produce', 'meat', 'dairy', 'pantry', 'frozen', 'bakery', 'other'));

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert common household staples for existing households
DO $$
DECLARE
    household_record RECORD;
BEGIN
    -- Add sample staples for each existing household
    FOR household_record IN SELECT id FROM households
    LOOP
        INSERT INTO household_staples (household_id, item_name, category, frequency, notes) VALUES
        (household_record.id, 'Milk', 'dairy', 'weekly', '2% or whole milk'),
        (household_record.id, 'Bread', 'bakery', 'weekly', 'Whole wheat preferred'),
        (household_record.id, 'Eggs', 'dairy', 'weekly', 'Large eggs'),
        (household_record.id, 'Bananas', 'produce', 'weekly', 'For breakfast'),
        (household_record.id, 'Olive Oil', 'pantry', 'monthly', 'Extra virgin'),
        (household_record.id, 'Salt', 'pantry', 'monthly', 'Sea salt'),
        (household_record.id, 'Black Pepper', 'pantry', 'monthly', 'Ground pepper'),
        (household_record.id, 'Onions', 'produce', 'biweekly', 'Yellow onions'),
        (household_record.id, 'Garlic', 'produce', 'biweekly', 'Fresh bulbs')
        ON CONFLICT (household_id, item_name) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- VERIFICATION AND CLEANUP
-- ============================================================================

-- Update the legacy generate_grocery_list function to use the new one
CREATE OR REPLACE FUNCTION generate_grocery_list(plan_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN generate_grocery_list_with_staples(plan_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETION LOG
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== Migration 004 Completed Successfully ===';
    RAISE NOTICE 'Fixed household staples integration issues:';
    RAISE NOTICE '✅ Corrected RLS policies to use actual schema structure';
    RAISE NOTICE '✅ Added proper foreign key relationships and constraints';
    RAISE NOTICE '✅ Created performance indexes for optimal queries';
    RAISE NOTICE '✅ Integrated staples with grocery list generation';
    RAISE NOTICE '✅ Added staples usage tracking and frequency management';
    RAISE NOTICE '✅ Enhanced database functions for complete integration';
    RAISE NOTICE '✅ Added sample staples data for existing households';
    RAISE NOTICE '';
    RAISE NOTICE 'Database is now ready for household staples management!';
END $$;
