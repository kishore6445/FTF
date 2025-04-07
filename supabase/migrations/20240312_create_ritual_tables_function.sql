-- Function to create the mission_items table if it doesn't exist
CREATE OR REPLACE FUNCTION create_mission_items_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'mission_items'
  ) THEN
    -- Create the mission_items table
    CREATE TABLE public.mission_items (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      priority INTEGER DEFAULT 1,
      type TEXT NOT NULL,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ritual_type TEXT,
      start_time TEXT,
      end_time TEXT,
      task_id UUID
    );

    -- Add RLS policies
    ALTER TABLE public.mission_items ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to select their own mission items
    CREATE POLICY "Users can view their own mission items"
      ON public.mission_items
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Create policy for users to insert their own mission items
    CREATE POLICY "Users can insert their own mission items"
      ON public.mission_items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Create policy for users to update their own mission items
    CREATE POLICY "Users can update their own mission items"
      ON public.mission_items
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Create policy for users to delete their own mission items
    CREATE POLICY "Users can delete their own mission items"
      ON public.mission_items
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- Function to create the ritual_completions table if it doesn't exist
CREATE OR REPLACE FUNCTION create_ritual_completions_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'ritual_completions'
  ) THEN
    -- Create the ritual_completions table
    CREATE TABLE public.ritual_completions (
      id UUID PRIMARY KEY,
      ritual_id UUID NOT NULL,
      date TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies
    ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to select their own ritual completions
    CREATE POLICY "Users can view their own ritual completions"
      ON public.ritual_completions
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Create policy for users to insert their own ritual completions
    CREATE POLICY "Users can insert their own ritual completions"
      ON public.ritual_completions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Create policy for users to update their own ritual completions
    CREATE POLICY "Users can update their own ritual completions"
      ON public.ritual_completions
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Create policy for users to delete their own ritual completions
    CREATE POLICY "Users can delete their own ritual completions"
      ON public.ritual_completions
      FOR DELETE
      USING (auth.uid() = user_id);
    
    -- Create unique constraint to prevent duplicate entries
    CREATE UNIQUE INDEX ritual_completions_unique_idx ON public.ritual_completions (ritual_id, date, user_id);
  END IF;
END;
$$;

