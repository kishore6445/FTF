-- Create a function to create the meetings table
CREATE OR REPLACE FUNCTION create_meetings_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'meetings'
  ) THEN
    -- Create extension for UUID generation if it doesn't exist
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create the meetings table
    CREATE TABLE public.meetings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      duration INTEGER NOT NULL DEFAULT 60,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies
    ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
    
    -- Policy for select
    CREATE POLICY meetings_select_policy ON public.meetings
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Policy for insert
    CREATE POLICY meetings_insert_policy ON public.meetings
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Policy for update
    CREATE POLICY meetings_update_policy ON public.meetings
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Policy for delete
    CREATE POLICY meetings_delete_policy ON public.meetings
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- Execute the function to create the table
SELECT create_meetings_table();

