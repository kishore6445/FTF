-- Ensure mission_items table exists
CREATE TABLE IF NOT EXISTS mission_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 1,
  type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ritual_type TEXT,
  days_of_week TEXT[],
  streak_goal INTEGER DEFAULT 21,
  task_id UUID
);

-- Ensure ritual_completions table exists
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  missed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE mission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for mission_items if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'mission_items' AND policyname = 'Users can view their own mission items'
  ) THEN
    CREATE POLICY "Users can view their own mission items" ON mission_items FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'mission_items' AND policyname = 'Users can insert their own mission items'
  ) THEN
    CREATE POLICY "Users can insert their own mission items" ON mission_items FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'mission_items' AND policyname = 'Users can update their own mission items'
  ) THEN
    CREATE POLICY "Users can update their own mission items" ON mission_items FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'mission_items' AND policyname = 'Users can delete their own mission items'
  ) THEN
    CREATE POLICY "Users can delete their own mission items" ON mission_items FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create policies for ritual_completions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'ritual_completions' AND policyname = 'Users can view their own ritual completions'
  ) THEN
    CREATE POLICY "Users can view their own ritual completions" ON ritual_completions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'ritual_completions' AND policyname = 'Users can insert their own ritual completions'
  ) THEN
    CREATE POLICY "Users can insert their own ritual completions" ON ritual_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'ritual_completions' AND policyname = 'Users can update their own ritual completions'
  ) THEN
    CREATE POLICY "Users can update their own ritual completions" ON ritual_completions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'ritual_completions' AND policyname = 'Users can delete their own ritual completions'
  ) THEN
    CREATE POLICY "Users can delete their own ritual completions" ON ritual_completions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_mission_items_user_id ON mission_items(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_items_type ON mission_items(type);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(date);

