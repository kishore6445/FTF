-- Create the dimension_goals table if it doesn't exist
CREATE OR REPLACE FUNCTION create_dimension_goals_table()
RETURNS void AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'dimension_goals'
  ) THEN
    -- Create the table
    CREATE TABLE public.dimension_goals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      dimension TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX dimension_goals_user_id_idx ON public.dimension_goals(user_id);
    CREATE INDEX dimension_goals_dimension_idx ON public.dimension_goals(dimension);
    
    -- Set up RLS policies
    ALTER TABLE public.dimension_goals ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their own dimension goals"
      ON public.dimension_goals
      FOR SELECT
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert their own dimension goals"
      ON public.dimension_goals
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own dimension goals"
      ON public.dimension_goals
      FOR UPDATE
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can delete their own dimension goals"
      ON public.dimension_goals
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_dimension_goals_table();

