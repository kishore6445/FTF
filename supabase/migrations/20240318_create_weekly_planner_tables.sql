-- Create weekly plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  theme TEXT,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Create big rocks table
CREATE TABLE IF NOT EXISTS big_rocks (
  id UUID PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE big_rocks ENABLE ROW LEVEL SECURITY;

-- Weekly plans policies
CREATE POLICY "Users can view their own weekly plans"
ON weekly_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly plans"
ON weekly_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly plans"
ON weekly_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly plans"
ON weekly_plans FOR DELETE
USING (auth.uid() = user_id);

-- Big rocks policies
CREATE POLICY "Users can view their own big rocks"
ON big_rocks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own big rocks"
ON big_rocks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own big rocks"
ON big_rocks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own big rocks"
ON big_rocks FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_plans_updated_at
BEFORE UPDATE ON weekly_plans
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_big_rocks_updated_at
BEFORE UPDATE ON big_rocks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

