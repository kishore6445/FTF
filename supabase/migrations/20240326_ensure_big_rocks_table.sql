-- Create function to create big_rocks table
CREATE OR REPLACE FUNCTION create_big_rocks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'big_rocks'
  ) THEN
    RAISE NOTICE 'Table big_rocks already exists, skipping creation';
    RETURN;
  END IF;

  -- Create the big_rocks table
  CREATE TABLE public.big_rocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    timeframe TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL
  );

  -- Enable RLS
  ALTER TABLE public.big_rocks ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Users can view their own big rocks" 
    ON public.big_rocks FOR SELECT 
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own big rocks" 
    ON public.big_rocks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own big rocks" 
    ON public.big_rocks FOR UPDATE 
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own big rocks" 
    ON public.big_rocks FOR DELETE 
    USING (auth.uid() = user_id);

  -- Create indexes
  CREATE INDEX idx_big_rocks_user_id ON public.big_rocks(user_id);
  CREATE INDEX idx_big_rocks_task_id ON public.big_rocks(task_id);
  
  RAISE NOTICE 'Successfully created big_rocks table';
END;
$$;

-- Execute the function to create the table if it doesn't exist
SELECT create_big_rocks_table();

