-- First ensure recurrence_patterns table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'recurrence_patterns'
  ) THEN
    CREATE TABLE public.recurrence_patterns (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      frequency text NOT NULL,
      interval integer NOT NULL,
      days_of_week text[] NULL,
      day_of_month integer NULL,
      month_of_year integer NULL,
      start_date date NOT NULL,
      end_date date NULL,
      count integer NULL,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone
    );

    -- Add RLS policies for recurrence_patterns
    ALTER TABLE public.recurrence_patterns ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own recurrence patterns"
    ON public.recurrence_patterns FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own recurrence patterns"
    ON public.recurrence_patterns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own recurrence patterns"
    ON public.recurrence_patterns FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own recurrence patterns"
    ON public.recurrence_patterns FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure due_date column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_date DATE;
  END IF;
END $$;

-- Ensure recurrence_id column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'recurrence_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN recurrence_id UUID REFERENCES recurrence_patterns(id) ON DELETE SET NULL;
  END IF;
END $$;

