-- Meal Planning App - Initial Database Schema
-- This script creates all tables, indexes, RLS policies, and functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

-- 1. households table
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions TEXT NOT NULL,
    source_url TEXT,
    prep_time TEXT,
    cuisine TEXT,
    estimated_nutrition JSONB,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    grocery_list JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. planned_meals table
CREATE TABLE IF NOT EXISTS planned_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. meal_plan_shares table
CREATE TABLE IF NOT EXISTS meal_plan_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- households indexes
CREATE INDEX IF NOT EXISTS idx_households_created_at ON households(created_at);

-- users indexes
CREATE INDEX IF NOT EXISTS idx_users_household_id ON users(household_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_owner_id ON recipes(owner_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_recipes_ingredients ON recipes USING gin(ingredients);

-- meal_plans indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_owner_id ON meal_plans(owner_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_start_date ON meal_plans(start_date);

-- planned_meals indexes
CREATE INDEX IF NOT EXISTS idx_planned_meals_meal_plan_id ON planned_meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_recipe_id ON planned_meals(recipe_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_planned_meals_unique ON planned_meals(meal_plan_id, day_of_week, meal_type);

-- meal_plan_shares indexes
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_meal_plan_id ON meal_plan_shares(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_user_id ON meal_plan_shares(shared_with_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plan_shares_unique ON meal_plan_shares(meal_plan_id, shared_with_user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

DROP POLICY IF EXISTS "Users can view accessible meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can create meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update accessible meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;

DROP POLICY IF EXISTS "Users can view accessible planned meals" ON planned_meals;
DROP POLICY IF EXISTS "Users can create planned meals" ON planned_meals;
DROP POLICY IF EXISTS "Users can update accessible planned meals" ON planned_meals;
DROP POLICY IF EXISTS "Users can delete accessible planned meals" ON planned_meals;

DROP POLICY IF EXISTS "Users can view meal plan shares" ON meal_plan_shares;
DROP POLICY IF EXISTS "Users can create meal plan shares" ON meal_plan_shares;
DROP POLICY IF EXISTS "Users can delete own meal plan shares" ON meal_plan_shares;

-- users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- recipes table policies
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = owner_id);

-- meal_plans table policies
CREATE POLICY "Users can view accessible meal plans" ON meal_plans
    FOR SELECT USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM meal_plan_shares
            WHERE meal_plan_id = meal_plans.id
            AND shared_with_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create meal plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update accessible meal plans" ON meal_plans
    FOR UPDATE USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM meal_plan_shares
            WHERE meal_plan_id = meal_plans.id
            AND shared_with_user_id = auth.uid()
            AND can_edit = true
        )
    );

CREATE POLICY "Users can delete own meal plans" ON meal_plans
    FOR DELETE USING (auth.uid() = owner_id);

-- planned_meals table policies
CREATE POLICY "Users can view accessible planned meals" ON planned_meals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND (
                owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meal_plan_shares
                    WHERE meal_plan_id = meal_plans.id
                    AND shared_with_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can create planned meals" ON planned_meals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND (
                owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meal_plan_shares
                    WHERE meal_plan_id = meal_plans.id
                    AND shared_with_user_id = auth.uid()
                    AND can_edit = true
                )
            )
        )
    );

CREATE POLICY "Users can update accessible planned meals" ON planned_meals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND (
                owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meal_plan_shares
                    WHERE meal_plan_id = meal_plans.id
                    AND shared_with_user_id = auth.uid()
                    AND can_edit = true
                )
            )
        )
    );

CREATE POLICY "Users can delete accessible planned meals" ON planned_meals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND (
                owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meal_plan_shares
                    WHERE meal_plan_id = meal_plans.id
                    AND shared_with_user_id = auth.uid()
                    AND can_edit = true
                )
            )
        )
    );

-- meal_plan_shares table policies
CREATE POLICY "Users can view meal plan shares" ON meal_plan_shares
    FOR SELECT USING (
        shared_with_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create meal plan shares" ON meal_plan_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meal plan shares" ON meal_plan_shares
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE id = meal_plan_id
            AND owner_id = auth.uid()
        )
    );

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to generate grocery list from meal plan
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

-- Function to update meal plan grocery list automatically
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

-- Create trigger for automatic grocery list updates
DROP TRIGGER IF EXISTS trigger_update_grocery_list ON planned_meals;
CREATE TRIGGER trigger_update_grocery_list
    AFTER INSERT OR UPDATE OR DELETE ON planned_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_plan_grocery_list();

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample household
INSERT INTO households (id, household_name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Test Household')
ON CONFLICT (id) DO NOTHING;

-- Note: Sample users and recipes will be created when users sign up
-- This ensures proper auth.uid() relationships

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: households, users, recipes, meal_plans, planned_meals, meal_plan_shares';
    RAISE NOTICE 'Indexes created for performance optimization';
    RAISE NOTICE 'RLS policies enabled for security';
    RAISE NOTICE 'Functions and triggers created for automation';
    RAISE NOTICE 'Ready for user authentication and data operations';
END $$;
