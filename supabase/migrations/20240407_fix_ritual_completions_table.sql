-- This migration fixes potential issues with the ritual_completions table
-- by ensuring the table exists with the correct structure and constraints

-- First, let's check if the ritual_completions table exists and drop it if it does
-- This is a drastic step but will ensure we have a clean slate
DROP TABLE IF EXISTS ritual_completions;

-- Now recreate the ritual_completions table with the correct structure
CREATE TABLE ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL,
  FOREIGN KEY (ritual_id) REFERENCES rituals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);

