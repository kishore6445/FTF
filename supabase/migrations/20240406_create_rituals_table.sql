-- Create rituals table if it doesn't exist
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  category TEXT DEFAULT 'general',
  time_of_day TEXT DEFAULT 'morning',
  days_of_week TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rituals_user_id ON rituals(user_id);

-- Create ritual_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL,
  missed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ritual_id) REFERENCES rituals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);

