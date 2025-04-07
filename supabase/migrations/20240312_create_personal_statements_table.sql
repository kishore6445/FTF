-- Create a function to create the personal_statements table if it doesn't exist
CREATE OR REPLACE FUNCTION create_personal_statements_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'personal_statements'
  ) THEN
    -- Create the personal_statements table
    CREATE TABLE public.personal_statements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      mission TEXT,
      vision TEXT,
      values TEXT,
      eulogy TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.personal_statements ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to select their own statements
    CREATE POLICY "Users can view their own personal statements"
      ON public.personal_statements
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Policy for users to insert their own statements
    CREATE POLICY "Users can insert their own personal statements"
      ON public.personal_statements
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Policy for users to update their own statements
    CREATE POLICY "Users can update their own personal statements"
      ON public.personal_statements
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Policy for users to delete their own statements
    CREATE POLICY "Users can delete their own personal statements"
      ON public.personal_statements
      FOR DELETE
      USING (auth.uid() = user_id);
      
    -- Create index for faster lookups
    CREATE INDEX personal_statements_user_id_idx ON public.personal_statements(user_id);
  END IF;
END;
$$;

-- Create a function to create the mission_items table if it doesn't exist
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
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      priority INTEGER DEFAULT 0,
      type TEXT NOT NULL,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.mission_items ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to select their own items
    CREATE POLICY "Users can view their own mission items"
      ON public.mission_items
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Policy for users to insert their own items
    CREATE POLICY "Users can insert their own mission items"
      ON public.mission_items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Policy for users to update their own items
    CREATE POLICY "Users can update their own mission items"
      ON public.mission_items
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Policy for users to delete their own items
    CREATE POLICY "Users can delete their own mission items"
      ON public.mission_items
      FOR DELETE
      USING (auth.uid() = user_id);
      
    -- Create index for faster lookups
    CREATE INDEX mission_items_user_id_idx ON public.mission_items(user_id);
    CREATE INDEX mission_items_type_idx ON public.mission_items(type);
  END IF;
END;
$$;

