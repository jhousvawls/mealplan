# Apply Migration 004 - Household Staples Integration Fix

## Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `zgxhwqvmbhpdvegqqndk`
   - Navigate to **SQL Editor** in the left sidebar

2. **Apply the Migration**
   - Click **"New Query"** in the SQL Editor
   - Copy the entire contents of `database/migrations/004_fix_household_staples_integration.sql`
   - Paste it into the SQL Editor
   - Click **"Run"** to execute the script

3. **Expected Results**
   After successful execution, you should see:
   - ✅ Migration 004 Completed Successfully
   - ✅ Corrected RLS policies to use actual schema structure
   - ✅ Added proper foreign key relationships and constraints
   - ✅ Created performance indexes for optimal queries
   - ✅ Integrated staples with grocery list generation
   - ✅ Added staples usage tracking and frequency management
   - ✅ Enhanced database functions for complete integration
   - ✅ Added sample staples data for existing households

4. **Verification**
   After running the migration, verify it worked by checking:
   - New tables: `household_staples` and `staples_usage_history`
   - Sample staples data for "The Smith Family" household
   - Enhanced grocery list generation with staples integration

## Rollback (if needed)
If something goes wrong, you can rollback using:
`database/migrations/004_rollback.sql`

## What This Migration Fixes

### Issues Resolved:
1. **Broken RLS Policies**: Fixed references to non-existent `household_members` table
2. **Missing Foreign Keys**: Added proper relationships between tables
3. **Performance Issues**: Added optimized indexes for queries
4. **Integration Gaps**: Connected staples with grocery list generation
5. **Data Integrity**: Added constraints and validation rules

### New Features Added:
1. **Household Staples Management**: Track common household items
2. **Smart Frequency Tracking**: Weekly, biweekly, monthly staples
3. **Grocery List Integration**: Staples automatically added to grocery lists
4. **Usage History**: Track when staples were last added to lists
5. **Sample Data**: Pre-populated common staples for testing

The migration is safe to run and includes rollback procedures if needed.
