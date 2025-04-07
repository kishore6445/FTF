-- Check if the ritual_completions table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ritual_completions'
    ) THEN
        -- Check if the missed column already exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ritual_completions' 
            AND column_name = 'missed'
        ) THEN
            -- Add the missed column
            ALTER TABLE public.ritual_completions ADD COLUMN missed BOOLEAN DEFAULT FALSE;
            
            -- Add comment
            COMMENT ON COLUMN public.ritual_completions.missed IS 'Indicates if this day was explicitly marked as missed';
        END IF;
    END IF;
END
$$;

-- Update the create_ritual_completions_table function to include the missed column
CREATE OR REPLACE FUNCTION public.create_ritual_completions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the ritual_completions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.ritual_completions (
    id UUID PRIMARY KEY,
    ritual_id UUID NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    missed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add indexes
  CREATE INDEX IF NOT EXISTS ritual_completions_ritual_id_idx ON public.ritual_completions (ritual_id);
  CREATE INDEX IF NOT EXISTS ritual_completions_user_id_idx ON public.ritual_completions (user_id);
  CREATE INDEX IF NOT EXISTS ritual_completions_date_idx ON public.ritual_completions (date);
  CREATE UNIQUE INDEX IF NOT EXISTS ritual_completions_ritual_id_date_user_id_idx ON public.ritual_completions (ritual_id, date, user_id);

  -- Add RLS policies
  ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own ritual completions" ON public.ritual_completions;
  DROP POLICY IF EXISTS "Users can insert their own ritual completions" ON public.ritual_completions;
  DROP POLICY IF EXISTS "Users can update their own ritual completions" ON public.ritual_completions;
  DROP POLICY IF EXISTS "Users can delete their own ritual completions" ON public.ritual_completions;

  -- Create policies
  CREATE POLICY "Users can view their own ritual completions"
    ON public.ritual_completions FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own ritual completions"
    ON public.ritual_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own ritual completions"
    ON public.ritual_completions FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own ritual completions"
    ON public.ritual_completions FOR DELETE
    USING (auth.uid() = user_id);
END;
$$;

