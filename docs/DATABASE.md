# Database Schema

## Overview

The Meal Planner App uses Supabase (PostgreSQL) as the primary database with a relational schema designed for multi-user meal planning and collaboration.

## Database Design Principles

- **Normalization**: Properly normalized to reduce data redundancy
- **Relationships**: Clear foreign key relationships between entities
- **Security**: Row Level Security (RLS) policies for data isolation
- **Scalability**: Indexed for performance with large datasets
- **Flexibility**: JSONB fields for semi-structured data

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   households    │    │      users      │    │    recipes      │
│                 │    │                 │    │                 │
│ id (PK)         │◄───┤ household_id    │    │ id (PK)         │
│ household_name  │    │ id (PK)         │◄───┤ owner_id        │
│ created_at      │    │ email           │    │ name            │
└─────────────────┘    │ full_name       │    │ ingredients     │
                       │ avatar_url      │    │ instructions    │
                       └─────────────────┘    │ source_url      │
                                              │ prep_time       │
                                              │ cuisine         │
                                              │ nutrition       │
                                              └─────────────────┘
                                                       │
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ meal_plan_shares│    │   meal_plans    │    │ planned_meals   │
│                 │    │                 │    │                 │
│ id (PK)         │    │ id (PK)         │◄───┤ meal_plan_id    │
│ meal_plan_id    │◄───┤ owner_id        │    │ recipe_id       │──┘
│ shared_with_id  │    │ plan_name       │    │ day_of_week     │
│ can_edit        │    │ start_date      │    │ meal_type       │
└─────────────────┘    │ grocery_list    │    │ id (PK)         │
                       │ created_at      │    └─────────────────┘
                       └─────────────────┘
```

## Table Definitions

### households

Represents a household unit that can contain multiple users.

```sql
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier for the household
- `household_name`: Display name for the household
- `created_at`: Timestamp when household was created

**Indexes:**
```sql
CREATE INDEX idx_households_created_at ON households(created_at);
```

### users

Extends Supabase auth.users with application-specific user data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: References auth.users.id (Supabase Auth)
- `email`: User's email address
- `full_name`: User's display name
- `avatar_url`: Profile picture URL
- `household_id`: Reference to user's household
- `created_at`: Account creation timestamp
- `updated_at`: Last profile update timestamp

**Indexes:**
```sql
CREATE INDEX idx_users_household_id ON users(household_id);
CREATE INDEX idx_users_email ON users(email);
```

### recipes

Stores recipe information with flexible ingredient and nutrition data.

```sql
CREATE TABLE recipes (
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
```

**Columns:**
- `id`: Unique identifier for the recipe
- `name`: Recipe title
- `ingredients`: JSON array of ingredient objects
- `instructions`: Step-by-step cooking instructions
- `source_url`: Optional URL to original recipe
- `prep_time`: Estimated preparation time
- `cuisine`: Cuisine type (e.g., "Italian", "Mexican")
- `estimated_nutrition`: JSON object with nutritional information
- `owner_id`: User who created/owns the recipe
- `created_at`: Recipe creation timestamp
- `updated_at`: Last modification timestamp

**Ingredient JSON Structure:**
```json
[
    {
        "name": "Chicken Breast",
        "amount": "2 lbs",
        "unit": "pounds",
        "notes": "boneless, skinless"
    },
    {
        "name": "Olive Oil",
        "amount": "2",
        "unit": "tablespoons"
    }
]
```

**Nutrition JSON Structure:**
```json
{
    "calories": 450,
    "protein": "35g",
    "carbs": "12g",
    "fat": "28g",
    "fiber": "3g",
    "servings": 4
}
```

**Indexes:**
```sql
CREATE INDEX idx_recipes_owner_id ON recipes(owner_id);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_name ON recipes USING gin(to_tsvector('english', name));
CREATE INDEX idx_recipes_ingredients ON recipes USING gin(ingredients);
```

### meal_plans

Represents a meal planning period (typically a week).

```sql
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    grocery_list JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier for the meal plan
- `owner_id`: User who created the meal plan
- `plan_name`: Display name for the plan (e.g., "Week of July 21")
- `start_date`: Starting date of the meal plan
- `grocery_list`: JSON array of grocery items
- `created_at`: Plan creation timestamp
- `updated_at`: Last modification timestamp

**Grocery List JSON Structure:**
```json
[
    {
        "item": "Milk",
        "quantity": "1 gallon",
        "category": "Dairy",
        "checked": false,
        "notes": "2% or whole milk"
    },
    {
        "item": "Chicken Breast",
        "quantity": "2 lbs",
        "category": "Meat",
        "checked": true
    }
]
```

**Indexes:**
```sql
CREATE INDEX idx_meal_plans_owner_id ON meal_plans(owner_id);
CREATE INDEX idx_meal_plans_start_date ON meal_plans(start_date);
```

### planned_meals

Junction table connecting recipes to specific meals in a meal plan.

```sql
CREATE TABLE planned_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier for the planned meal
- `meal_plan_id`: Reference to the meal plan
- `recipe_id`: Reference to the recipe
- `day_of_week`: Day when meal is planned
- `meal_type`: Type of meal (breakfast, lunch, dinner, snack)
- `created_at`: When meal was added to plan

**Indexes:**
```sql
CREATE INDEX idx_planned_meals_meal_plan_id ON planned_meals(meal_plan_id);
CREATE INDEX idx_planned_meals_recipe_id ON planned_meals(recipe_id);
CREATE UNIQUE INDEX idx_planned_meals_unique ON planned_meals(meal_plan_id, day_of_week, meal_type);
```

### meal_plan_shares

Manages sharing permissions for meal plans between users.

```sql
CREATE TABLE meal_plan_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier for the share record
- `meal_plan_id`: Reference to the shared meal plan
- `shared_with_user_id`: User who has access to the plan
- `can_edit`: Whether user can modify the plan
- `created_at`: When sharing was granted

**Indexes:**
```sql
CREATE INDEX idx_meal_plan_shares_meal_plan_id ON meal_plan_shares(meal_plan_id);
CREATE INDEX idx_meal_plan_shares_user_id ON meal_plan_shares(shared_with_user_id);
CREATE UNIQUE INDEX idx_meal_plan_shares_unique ON meal_plan_shares(meal_plan_id, shared_with_user_id);
```

## Row Level Security (RLS) Policies

### users table
```sql
-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

### recipes table
```sql
-- Users can only see their own recipes
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = owner_id);
```

### meal_plans table
```sql
-- Users can see their own plans and plans shared with them
CREATE POLICY "Users can view own meal plans" ON meal_plans
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

CREATE POLICY "Users can update own meal plans" ON meal_plans
    FOR UPDATE USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM meal_plan_shares
            WHERE meal_plan_id = meal_plans.id
            AND shared_with_user_id = auth.uid()
            AND can_edit = true
        )
    );
```

### planned_meals table
```sql
-- Users can see planned meals for accessible meal plans
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
```

## Database Functions

### Generate Grocery List
```sql
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
                    'checked', false
                )
            );
        END LOOP;
    END LOOP;
    
    RETURN grocery_items;
END;
$$ LANGUAGE plpgsql;
```

### Update Meal Plan Grocery List
```sql
CREATE OR REPLACE FUNCTION update_meal_plan_grocery_list()
RETURNS TRIGGER AS $$
BEGIN
    -- Update grocery list when planned meals change
    UPDATE meal_plans
    SET grocery_list = generate_grocery_list(NEW.meal_plan_id),
        updated_at = NOW()
    WHERE id = NEW.meal_plan_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_grocery_list
    AFTER INSERT OR UPDATE OR DELETE ON planned_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_plan_grocery_list();
```

## Migration Scripts

### Initial Schema Migration
```sql
-- Create tables in dependency order
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. households
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. users (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. recipes
CREATE TABLE recipes (
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

-- 4. meal_plans
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    grocery_list JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. planned_meals
CREATE TABLE planned_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. meal_plan_shares
CREATE TABLE meal_plan_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create all indexes
-- (Include all index creation statements from above)

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_shares ENABLE ROW LEVEL SECURITY;

-- Create all RLS policies
-- (Include all policy creation statements from above)
```

## Sample Data

### Sample Households
```sql
INSERT INTO households (id, household_name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'The Smith Family'),
('550e8400-e29b-41d4-a716-446655440002', 'Downtown Roommates');
```

### Sample Recipes
```sql
INSERT INTO recipes (name, ingredients, instructions, prep_time, cuisine, owner_id) VALUES
(
    'Chicken Stir Fry',
    '[
        {"name": "Chicken Breast", "amount": "1 lb", "unit": "pound"},
        {"name": "Bell Peppers", "amount": "2", "unit": "pieces"},
        {"name": "Soy Sauce", "amount": "3", "unit": "tablespoons"},
        {"name": "Garlic", "amount": "3", "unit": "cloves"}
    ]',
    '1. Cut chicken into strips\n2. Heat oil in wok\n3. Cook chicken until done\n4. Add vegetables and sauce\n5. Stir fry for 5 minutes',
    '20 minutes',
    'Asian',
    'user-id-here'
);
```

## Performance Considerations

### Query Optimization
- Use appropriate indexes for common query patterns
- Implement pagination for large result sets
- Use JSONB operators efficiently for ingredient searches
- Consider materialized views for complex aggregations

### Monitoring
- Track slow queries and optimize as needed
- Monitor connection pool usage
- Set up alerts for database performance metrics
- Regular VACUUM and ANALYZE operations

### Backup Strategy
- Automated daily backups via Supabase
- Point-in-time recovery capability
- Test backup restoration procedures
- Document recovery procedures
