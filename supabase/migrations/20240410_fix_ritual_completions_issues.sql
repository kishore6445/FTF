-- This migration fixes issues with ritual completions

-- First, let's check for any orphaned ritual_completions and remove them
DELETE FROM ritual_completions
WHERE NOT EXISTS (
  SELECT 1 FROM rituals WHERE rituals.id = ritual_completions.ritual_id
);

-- Create a more robust function to safely add ritual completions
CREATE OR REPLACE FUNCTION safely_add_ritual_completion(
  p_ritual_id UUID,
  p_user_id UUID,
  p_date TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  v_ritual_exists BOOLEAN;
  v_completion_id UUID;
  v_result JSONB;
  v_existing_completion UUID;
BEGIN
  -- Check if the ritual exists
  SELECT EXISTS(SELECT 1 FROM rituals WHERE id = p_ritual_id) INTO v_ritual_exists;
  
  IF NOT v_ritual_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ritual does not exist',
      'ritual_id', p_ritual_id
    );
  END IF;
  
  -- Check if a completion already exists for this date and ritual
  SELECT id INTO v_existing_completion
  FROM ritual_completions
  WHERE ritual_id = p_ritual_id
    AND user_id = p_user_id
    AND date::date = p_date::date
  LIMIT 1;
  
  -- If it exists, return it
  IF v_existing_completion IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'id', v_existing_completion,
      'ritual_id', p_ritual_id,
      'user_id', p_user_id,
      'date', p_date,
      'message', 'Existing completion found'
    );
  END IF;
  
  -- Generate a new UUID for the completion
  v_completion_id := uuid_generate_v4();
  
  -- Insert the completion
  BEGIN
    INSERT INTO ritual_completions (id, ritual_id, user_id, date)
    VALUES (v_completion_id, p_ritual_id, p_user_id, p_date);
    
    RETURN jsonb_build_object(
      'success', true,
      'id', v_completion_id,
      'ritual_id', p_ritual_id,
      'user_id', p_user_id,
      'date', p_date,
      'message', 'New completion created'
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'ritual_id', p_ritual_id
    );
  END;
END;
$$ LANGUAGE plpgsql;

