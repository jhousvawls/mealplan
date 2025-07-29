# Database Setup Guide

## Quick Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `zgxhwqvmbhpdvegqqndk`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Migration Scripts
1. Click **"New Query"** in the SQL Editor
2. Copy the entire contents of `migrations/001_initial_schema.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the script
5. **Run the second migration**: Copy the contents of `migrations/002_add_recipe_fields.sql`
6. Paste it into a new query and click **"Run"**
7. **Run the household staples fix**: Copy the contents of `migrations/004_fix_household_staples_integration.sql`
8. Paste it into a new query and click **"Run"**

### Step 3: Verify Setup
After running all three scripts, you should see:
- ✅ 8 tables created (households, users, recipes, meal_plans, planned_meals, meal_plan_shares, household_staples, staples_usage_history)
- ✅ Enhanced recipes table with categorization fields
- ✅ Enhanced planned_meals table with serving sizes and batch cooking
- ✅ **Fixed household staples integration** with proper foreign key relationships
- ✅ All indexes created for performance
- ✅ Row Level Security (RLS) policies enabled
- ✅ Database functions and triggers created
- ✅ Auto-categorization system for recipes
- ✅ **Household staples system** with smart grocery list integration
- ✅ Sample household and staples data inserted

### Step 4: Test Connection
1. Go back to your running app at http://localhost:5176/
2. The "Supabase Connection Test" should now show: ✅ Connected successfully!

## What This Script Creates

### Tables
1. **households** - For multi-user household management
2. **users** - Extended user profiles (linked to auth.users)
3. **recipes** - Recipe storage with JSONB ingredients
4. **meal_plans** - Weekly meal planning periods
5. **planned_meals** - Individual meals within plans
6. **meal_plan_shares** - Sharing permissions between users
7. **household_staples** - Common household items with frequency tracking
8. **staples_usage_history** - Track when staples were added to grocery lists

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Proper sharing permissions for meal plans
- Secure database functions

### Automation Features
- **Auto user profile creation** when users sign up
- **Auto grocery list generation** from meal plans
- **Optimized indexes** for fast queries

## Next Steps After Database Setup

1. **Enable Authentication** - Set up Google OAuth in Supabase Auth settings
2. **Test User Registration** - Create a test account to verify the user profile trigger
3. **Add Sample Data** - Create some test recipes and meal plans
4. **Update Frontend** - Connect real data instead of mock data

## Troubleshooting

### If you get permission errors:
- Make sure you're logged into the correct Supabase project
- Verify you have admin access to the project

### If tables already exist:
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to re-run
- It will skip existing tables and only create missing ones

### If RLS policies fail:
- The script drops existing policies before creating new ones
- Safe to re-run if needed

### If migration 004 fails:
- Use the rollback script: `migrations/004_rollback.sql`
- This will restore the database to the pre-migration 004 state
- Then you can retry the migration

### Migration 003 Issues:
- **Do not run migration 003** - it has broken RLS policies
- Migration 004 replaces and fixes all issues from migration 003
- If you accidentally ran migration 003, run migration 004 to fix it

## Sample Data Structure

### Recipe Example:
```json
{
  "name": "Chicken Stir Fry",
  "ingredients": [
    {
      "name": "Chicken Breast",
      "amount": "1 lb",
      "unit": "pound",
      "notes": "boneless, skinless"
    },
    {
      "name": "Bell Peppers",
      "amount": "2",
      "unit": "pieces"
    }
  ],
  "instructions": "1. Cut chicken into strips\n2. Heat oil in wok...",
  "prep_time": "20 minutes",
  "cuisine": "Asian"
}
```

### Grocery List Example:
```json
[
  {
    "item": "Chicken Breast",
    "quantity": "1 lb",
    "category": "Meat",
    "checked": false,
    "notes": "boneless, skinless"
  },
  {
    "item": "Bell Peppers",
    "quantity": "2",
    "category": "Vegetables",
    "checked": false
  }
]
```

Ready to run the migration? Copy the SQL from `migrations/001_initial_schema.sql` and paste it into your Supabase SQL Editor!
