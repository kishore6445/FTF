-- Create task_recurrence table
CREATE TABLE IF NOT EXISTS task_recurrence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval INTEGER NOT NULL DEFAULT 1,
  days_of_week TEXT[] NULL,
  day_of_month INTEGER NULL,
  month_of_year INTEGER NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  count INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE task_recurrence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own task recurrence patterns"
  ON task_recurrence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task recurrence patterns"
  ON task_recurrence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task recurrence patterns"
  ON task_recurrence FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task recurrence patterns"
  ON task_recurrence FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_task_recurrence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_recurrence_updated_at
BEFORE UPDATE ON task_recurrence
FOR EACH ROW
EXECUTE FUNCTION update_task_recurrence_updated_at();

