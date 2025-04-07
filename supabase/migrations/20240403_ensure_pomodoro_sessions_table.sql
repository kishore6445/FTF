-- Create pomodoro_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add time_spent column to tasks table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'time_spent'
  ) THEN
    ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);

-- Add RLS policies
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can view their own pomodoro sessions'
  ) THEN
    CREATE POLICY "Users can view their own pomodoro sessions" 
    ON pomodoro_sessions FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can insert their own pomodoro sessions'
  ) THEN
    CREATE POLICY "Users can insert their own pomodoro sessions" 
    ON pomodoro_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can update their own pomodoro sessions'
  ) THEN
    CREATE POLICY "Users can update their own pomodoro sessions" 
    ON pomodoro_sessions FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can delete their own pomodoro sessions'
  ) THEN
    CREATE POLICY "Users can delete their own pomodoro sessions" 
    ON pomodoro_sessions FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END
$$;

