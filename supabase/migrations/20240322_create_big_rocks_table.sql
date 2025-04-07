-- Create function to create big_rocks table
CREATE OR REPLACE FUNCTION create_big_rocks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the big_rocks table if it doesn't exist
  CREATE TABLE IF NOT EXISTS big_rocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE big_rocks ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DO $$
  BEGIN
    -- Check if policies exist before creating them
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'big_rocks' AND policyname = 'Users can view their own big rocks'
    ) THEN
      CREATE POLICY "Users can view their own big rocks" 
        ON big_rocks FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'big_rocks' AND policyname = 'Users can insert their own big rocks'
    ) THEN
      CREATE POLICY "Users can insert their own big rocks" 
        ON big_rocks FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'big_rocks' AND policyname = 'Users can update their own big rocks'
    ) THEN
      CREATE POLICY "Users can update their own big rocks" 
        ON big_rocks FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'big_rocks' AND policyname = 'Users can delete their own big rocks'
    ) THEN
      CREATE POLICY "Users can delete their own big rocks" 
        ON big_rocks FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
  END
  $$;

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_big_rocks_user_id ON big_rocks(user_id);
END;
$$;

-- Create function to run SQL
CREATE OR REPLACE FUNCTION run_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Execute the function to create the table
SELECT create_big_rocks_table();

