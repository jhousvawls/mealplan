-- Migration: Add Household Staples System
-- This migration adds support for household staples management

-- Create household_staples table
CREATE TABLE household_staples (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'other',
    frequency VARCHAR(50) DEFAULT 'weekly', -- weekly, biweekly, monthly
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique staple items per household
    UNIQUE(household_id, item_name)
);

-- Create staples_usage_history table to track when staples were last added to lists
CREATE TABLE staples_usage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_staple_id UUID NOT NULL REFERENCES household_staples(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    added_to_list_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quantity VARCHAR(100),
    was_purchased BOOLEAN DEFAULT false,
    purchased_at TIMESTAMP WITH TIME ZONE
);

-- Add staples_included flag to meal_plans table
ALTER TABLE meal_plans 
ADD COLUMN staples_included BOOLEAN DEFAULT false,
ADD COLUMN staples_reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update grocery_list structure in meal_plans to include source tracking
-- Note: Since grocery_list is JSONB, we'll handle this in the application layer
-- Each grocery item will have a 'source' field: 'recipe', 'staple', 'manual'

-- Create indexes for performance
CREATE INDEX idx_household_staples_household_id ON household_staples(household_id);
CREATE INDEX idx_household_staples_active ON household_staples(household_id, is_active);
CREATE INDEX idx_staples_usage_history_staple_id ON staples_usage_history(household_staple_id);
CREATE INDEX idx_staples_usage_history_meal_plan ON staples_usage_history(meal_plan_id);

-- Add RLS policies for household_staples
ALTER TABLE household_staples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their household's staples" ON household_staples
    FOR SELECT USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert staples for their household" ON household_staples
    FOR INSERT WITH CHECK (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their household's staples" ON household_staples
    FOR UPDATE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their household's staples" ON household_staples
    FOR DELETE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add RLS policies for staples_usage_history
ALTER TABLE staples_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their household's staples usage" ON staples_usage_history
    FOR SELECT USING (
        household_staple_id IN (
            SELECT id FROM household_staples 
            WHERE household_id IN (
                SELECT household_id FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert staples usage for their household" ON staples_usage_history
    FOR INSERT WITH CHECK (
        household_staple_id IN (
            SELECT id FROM household_staples 
            WHERE household_id IN (
                SELECT household_id FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_household_staples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_household_staples_updated_at
    BEFORE UPDATE ON household_staples
    FOR EACH ROW
    EXECUTE FUNCTION update_household_staples_updated_at();

-- Insert some common household staples as examples (these can be customized per household)
-- Note: These will be handled in the application layer during household setup
