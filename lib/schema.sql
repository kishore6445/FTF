-- Create ritual_completions table
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY,
  ritual_id UUID NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (ritual_id) REFERENCES mission_items(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id_date ON ritual_completions(user_id, date);

-- Add is_ritual column to tasks table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'is_ritual'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_ritual BOOLEAN DEFAULT FALSE;
  END IF;
END
$$;

-- Add ritual_type, start_time, end_time columns to mission_items if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_items' AND column_name = 'ritual_type'
  ) THEN
    ALTER TABLE mission_items ADD COLUMN ritual_type TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_items' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE mission_items ADD COLUMN start_time TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_items' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE mission_items ADD COLUMN end_time TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_items' AND column_name = 'task_id'
  ) THEN
    ALTER TABLE mission_items ADD COLUMN task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
  END IF;
END
$$;

