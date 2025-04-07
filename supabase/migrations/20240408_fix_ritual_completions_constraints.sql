-- This migration fixes potential issues with the ritual_completions table
-- by ensuring the foreign key constraints are properly set up

-- First, let's check if there are any orphaned ritual_completions records
-- that reference non-existent rituals and delete them
DELETE FROM ritual_completions
WHERE NOT EXISTS (
  SELECT 1 FROM rituals WHERE rituals.id = ritual_completions.ritual_id
);

-- Now let's make sure the foreign key constraint is properly set up
-- First drop the constraint if it exists
ALTER TABLE ritual_completions 
DROP CONSTRAINT IF EXISTS ritual_completions_ritual_id_fkey;

-- Then recreate it with the correct reference
ALTER TABLE ritual_completions
ADD CONSTRAINT ritual_completions_ritual_id_fkey
FOREIGN KEY (ritual_id) REFERENCES rituals(id) ON DELETE CASCADE;

-- Create a function to safely add ritual completions
CREATE OR REPLACE FUNCTION add_ritual_completion(
  p_ritual_id UUID,
  p_user_id UUID,
  p_date TIMESTAMP WITH TIME ZONE
) RETURNS UUID AS $$
DECLARE
  v_ritual_exists BOOLEAN;
  v_completion_id UUID;
BEGIN
  -- Check if the ritual exists
  SELECT EXISTS(SELECT 1 FROM rituals WHERE id = p_ritual_id) INTO v_ritual_exists;
  
  IF NOT v_ritual_exists THEN
    RAISE EXCEPTION 'Ritual with ID % does not exist', p_ritual_id;
  END IF;
  
  -- Generate a new UUID for the completion
  v_completion_id := uuid_generate_v4();
  
  -- Insert the completion
  INSERT INTO ritual_completions (id, ritual_id, user_id, date)
  VALUES (v_completion_id, p_ritual_id, p_user_id, p_date);
  
  RETURN v_completion_id;
END;
$$ LANGUAGE plpgsql;

