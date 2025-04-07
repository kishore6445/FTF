-- Create pomodoro_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- Duration in seconds
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS pomodoro_sessions_user_id_idx ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS pomodoro_sessions_task_id_idx ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS pomodoro_sessions_start_time_idx ON pomodoro_sessions(start_time);

-- Add RLS policies
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own pomodoro sessions
DROP POLICY IF EXISTS pomodoro_sessions_select_policy ON pomodoro_sessions;
CREATE POLICY pomodoro_sessions_select_policy ON pomodoro_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert only their own pomodoro sessions
DROP POLICY IF EXISTS pomodoro_sessions_insert_policy ON pomodoro_sessions;
CREATE POLICY pomodoro_sessions_insert_policy ON pomodoro_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own pomodoro sessions
DROP POLICY IF EXISTS pomodoro_sessions_update_policy ON pomodoro_sessions;
CREATE POLICY pomodoro_sessions_update_policy ON pomodoro_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own pomodoro sessions
DROP POLICY IF EXISTS pomodoro_sessions_delete_policy ON pomodoro_sessions;
CREATE POLICY pomodoro_sessions_delete_policy ON pomodoro_sessions
  FOR DELETE USING (auth.uid() = user_id);

