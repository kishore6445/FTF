-- Add is_habit column to tasks table if it doesn't exist
ALTER TABLE IF EXISTS tasks 
ADD COLUMN IF NOT EXISTS is_habit BOOLEAN DEFAULT FALSE;

-- Create index on is_habit column for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_is_habit ON tasks(is_habit);

-- Ensure we have the ritual_completions table
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  missed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ritual_id, date)
);

-- Enable Row Level Security
ALTER TABLE IF EXISTS ritual_completions ENABLE ROW LEVEL SECURITY;

-- Create policies with proper checks to avoid errors if they already exist
DO $$
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ritual_completions' 
        AND policyname = 'Users can view their own ritual completions'
    ) THEN
        CREATE POLICY "Users can view their own ritual completions" 
        ON ritual_completions FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ritual_completions' 
        AND policyname = 'Users can insert their own ritual completions'
    ) THEN
        CREATE POLICY "Users can insert their own ritual completions" 
        ON ritual_completions FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ritual_completions' 
        AND policyname = 'Users can update their own ritual completions'
    ) THEN
        CREATE POLICY "Users can update their own ritual completions" 
        ON ritual_completions FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ritual_completions' 
        AND policyname = 'Users can delete their own ritual completions'
    ) THEN
        CREATE POLICY "Users can delete their own ritual completions" 
        ON ritual_completions FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(date);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);

