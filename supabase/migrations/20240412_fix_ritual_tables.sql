-- This migration fixes issues with the ritual tables

-- First, check if the rituals table exists and create it if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rituals' AND table_schema = 'public') THEN
    CREATE TABLE rituals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_rituals_user_id ON rituals(user_id);
  END IF;
END $$;

-- Drop and recreate the ritual_completions table to fix any issues
DROP TABLE IF EXISTS ritual_completions;

CREATE TABLE ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  user_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ritual_completions_ritual_id_fkey 
    FOREIGN KEY (ritual_id) 
    REFERENCES rituals(id) ON DELETE CASCADE,
  CONSTRAINT ritual_completions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(date);

-- Create a simple direct function to toggle ritual completions
CREATE OR REPLACE FUNCTION toggle_ritual_completion(
  p_ritual_id UUID,
  p_user_id UUID,
  p_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_result JSONB;
BEGIN
  -- Check if a completion already exists for this date and ritual
  SELECT id INTO v_existing_id
  FROM ritual_completions
  WHERE ritual_id = p_ritual_id
    AND user_id = p_user_id
    AND date::date = p_date
  LIMIT 1;
  
  -- If it exists, delete it
  IF v_existing_id IS NOT NULL THEN
    DELETE FROM ritual_completions WHERE id = v_existing_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'deleted',
      'id', v_existing_id
    );
  ELSE
    -- Otherwise, insert a new one
    INSERT INTO ritual_completions (ritual_id, user_id, date)
    VALUES (p_ritual_id, p_user_id, p_date)
    RETURNING id INTO v_existing_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'inserted',
      'id', v_existing_id
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'ritual_id', p_ritual_id,
    'user_id', p_user_id,
    'date', p_date
  );
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for the tables
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS rituals_select_policy ON rituals;
DROP POLICY IF EXISTS rituals_insert_policy ON rituals;
DROP POLICY IF EXISTS rituals_update_policy ON rituals;
DROP POLICY IF EXISTS rituals_delete_policy ON rituals;

DROP POLICY IF EXISTS ritual_completions_select_policy ON ritual_completions;
DROP POLICY IF EXISTS ritual_completions_insert_policy ON ritual_completions;
DROP POLICY IF EXISTS ritual_completions_update_policy ON ritual_completions;
DROP POLICY IF EXISTS ritual_completions_delete_policy ON ritual_completions;

-- Create policies for rituals
CREATE POLICY rituals_select_policy ON rituals
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY rituals_insert_policy ON rituals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY rituals_update_policy ON rituals
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY rituals_delete_policy ON rituals
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for ritual_completions
CREATE POLICY ritual_completions_select_policy ON ritual_completions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY ritual_completions_insert_policy ON ritual_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY ritual_completions_update_policy ON ritual_completions
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY ritual_completions_delete_policy ON ritual_completions
  FOR DELETE USING (auth.uid() = user_id);

