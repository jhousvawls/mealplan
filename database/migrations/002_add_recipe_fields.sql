-- Migration 002: Add missing recipe fields for categorization and enhanced features
-- This adds fields that are referenced in the TypeScript types but missing from the database

-- Add new columns to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS image_alt_text TEXT,
ADD COLUMN IF NOT EXISTS meal_types JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS prep_time_category TEXT CHECK (prep_time_category IN ('quick', 'medium', 'long')),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_types ON recipes USING gin(meal_types);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_restrictions ON recipes USING gin(dietary_restrictions);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_prep_time_category ON recipes(prep_time_category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_draft ON recipes(is_draft);

-- Update the planned_meals table to use integer day_of_week for better performance
-- First, add the new column
ALTER TABLE planned_meals 
ADD COLUMN IF NOT EXISTS day_of_week_int INTEGER CHECK (day_of_week_int >= 0 AND day_of_week_int <= 6);

-- Update existing data to convert text days to integers (0=Monday, 6=Sunday)
UPDATE planned_meals 
SET day_of_week_int = CASE 
    WHEN day_of_week = 'monday' THEN 0
    WHEN day_of_week = 'tuesday' THEN 1
    WHEN day_of_week = 'wednesday' THEN 2
    WHEN day_of_week = 'thursday' THEN 3
    WHEN day_of_week = 'friday' THEN 4
    WHEN day_of_week = 'saturday' THEN 5
    WHEN day_of_week = 'sunday' THEN 6
    ELSE 0
END
WHERE day_of_week_int IS NULL;

-- Add index for the new integer day column
CREATE INDEX IF NOT EXISTS idx_planned_meals_day_of_week_int ON planned_meals(day_of_week_int);

-- Add serving_size and notes fields to planned_meals for enhanced meal planning
ALTER TABLE planned_meals 
ADD COLUMN IF NOT EXISTS serving_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_batch_cook BOOLEAN DEFAULT FALSE;

-- Drop the old unique constraint and create a new one that allows multiple recipes per meal slot
DROP INDEX IF EXISTS idx_planned_meals_unique;
CREATE INDEX IF NOT EXISTS idx_planned_meals_meal_plan_day_type ON planned_meals(meal_plan_id, day_of_week_int, meal_type);

-- Add a function to auto-categorize recipes based on ingredients and name
CREATE OR REPLACE FUNCTION auto_categorize_recipe(recipe_name TEXT, ingredients JSONB)
RETURNS JSONB AS $$
DECLARE
    auto_tags JSONB := '[]';
    ingredient_text TEXT;
    name_lower TEXT := LOWER(recipe_name);
BEGIN
    -- Convert ingredients to searchable text
    ingredient_text := LOWER(ingredients::TEXT);
    
    -- Meal type categorization based on name
    IF name_lower ~ '(breakfast|pancake|waffle|cereal|oatmeal|toast|egg|bacon)' THEN
        auto_tags := auto_tags || '"breakfast"';
    END IF;
    
    IF name_lower ~ '(lunch|sandwich|salad|wrap|soup)' THEN
        auto_tags := auto_tags || '"lunch"';
    END IF;
    
    IF name_lower ~ '(dinner|steak|roast|casserole|pasta|curry)' THEN
        auto_tags := auto_tags || '"dinner"';
    END IF;
    
    IF name_lower ~ '(dessert|cake|cookie|pie|ice cream|chocolate|sweet)' THEN
        auto_tags := auto_tags || '"dessert"';
    END IF;
    
    IF name_lower ~ '(snack|chip|dip|appetizer)' THEN
        auto_tags := auto_tags || '"snack"';
    END IF;
    
    -- Dietary restrictions based on ingredients
    IF ingredient_text !~ '(meat|beef|pork|chicken|fish|seafood|bacon|ham)' THEN
        auto_tags := auto_tags || '"vegetarian"';
        
        IF ingredient_text !~ '(cheese|milk|butter|cream|egg|yogurt|dairy)' THEN
            auto_tags := auto_tags || '"vegan"';
        END IF;
    END IF;
    
    IF ingredient_text !~ '(flour|bread|wheat|gluten|pasta|noodle)' THEN
        auto_tags := auto_tags || '"gluten-free"';
    END IF;
    
    -- Cuisine categorization
    IF name_lower ~ '(italian|pasta|pizza|risotto|lasagna)' OR ingredient_text ~ '(parmesan|mozzarella|basil|oregano)' THEN
        auto_tags := auto_tags || '"italian"';
    END IF;
    
    IF name_lower ~ '(mexican|taco|burrito|quesadilla|salsa)' OR ingredient_text ~ '(cilantro|lime|jalapeño|cumin|chili)' THEN
        auto_tags := auto_tags || '"mexican"';
    END IF;
    
    IF name_lower ~ '(asian|chinese|thai|stir.fry|curry)' OR ingredient_text ~ '(soy sauce|ginger|garlic|sesame|rice)' THEN
        auto_tags := auto_tags || '"asian"';
    END IF;
    
    -- Cooking method and time
    IF name_lower ~ '(quick|easy|simple|fast|minute)' THEN
        auto_tags := auto_tags || '"quick"';
    END IF;
    
    IF name_lower ~ '(healthy|light|low.fat|diet)' THEN
        auto_tags := auto_tags || '"healthy"';
    END IF;
    
    RETURN auto_tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-categorize recipes on insert/update
CREATE OR REPLACE FUNCTION trigger_auto_categorize_recipe()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-categorize if tags are empty or null
    IF NEW.tags IS NULL OR jsonb_array_length(NEW.tags) = 0 THEN
        NEW.tags := auto_categorize_recipe(NEW.name, NEW.ingredients);
    END IF;
    
    -- Auto-set difficulty based on instructions length and complexity
    IF NEW.difficulty IS NULL THEN
        IF LENGTH(NEW.instructions) < 200 THEN
            NEW.difficulty := 'easy';
        ELSIF LENGTH(NEW.instructions) < 500 THEN
            NEW.difficulty := 'medium';
        ELSE
            NEW.difficulty := 'hard';
        END IF;
    END IF;
    
    -- Auto-set prep time category based on prep_time
    IF NEW.prep_time_category IS NULL AND NEW.prep_time IS NOT NULL THEN
        IF NEW.prep_time ~ '([0-2][0-9]|30) ?(min|minute)' THEN
            NEW.prep_time_category := 'quick';
        ELSIF NEW.prep_time ~ '([3-5][0-9]) ?(min|minute)' OR NEW.prep_time ~ '1 ?(hour|hr)' THEN
            NEW.prep_time_category := 'medium';
        ELSE
            NEW.prep_time_category := 'long';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_categorize_recipe ON recipes;
CREATE TRIGGER trigger_auto_categorize_recipe
    BEFORE INSERT OR UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_categorize_recipe();

-- Update existing recipes to have auto-generated tags
UPDATE recipes 
SET tags = auto_categorize_recipe(name, ingredients)
WHERE tags IS NULL OR jsonb_array_length(tags) = 0;

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration 002 completed successfully!';
    RAISE NOTICE 'Added recipe categorization fields: featured_image, image_alt_text, meal_types, dietary_restrictions, difficulty, prep_time_category, tags, is_draft';
    RAISE NOTICE 'Added planned_meals enhancements: day_of_week_int, serving_size, notes, is_batch_cook';
    RAISE NOTICE 'Added auto-categorization function and trigger';
    RAISE NOTICE 'Updated existing recipes with auto-generated tags';
END $$;
