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

-- Create big rocks table for weekly planning
CREATE TABLE IF NOT EXISTS weekly_big_rocks (
  id UUID PRIMARY KEY,
  weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  quadrant TEXT,
  priority INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily plans table
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY,
  weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_review TEXT,
  evening_reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create time blocks table
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY,
  daily_plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT,
  completed BOOLEAN DEFAULT FALSE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_big_rocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

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

-- Weekly big rocks policies
CREATE POLICY "Users can view their own weekly big rocks"
ON weekly_big_rocks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly big rocks"
ON weekly_big_rocks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly big rocks"
ON weekly_big_rocks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly big rocks"
ON weekly_big_rocks FOR DELETE
USING (auth.uid() = user_id);

-- Daily plans policies
CREATE POLICY "Users can view their own daily plans"
ON daily_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily plans"
ON daily_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily plans"
ON daily_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily plans"
ON daily_plans FOR DELETE
USING (auth.uid() = user_id);

-- Time blocks policies
CREATE POLICY "Users can view their own time blocks"
ON time_blocks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time blocks"
ON time_blocks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time blocks"
ON time_blocks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time blocks"
ON time_blocks FOR DELETE
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

CREATE TRIGGER update_weekly_big_rocks_updated_at
BEFORE UPDATE ON weekly_big_rocks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_daily_plans_updated_at
BEFORE UPDATE ON daily_plans
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_time_blocks_updated_at
BEFORE UPDATE ON time_blocks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

