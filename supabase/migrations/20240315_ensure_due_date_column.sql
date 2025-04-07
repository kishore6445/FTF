-- Make sure due_date column exists and has the right type
DO $$
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tasks'
    AND column_name = 'due_date'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE public.tasks ADD COLUMN due_date DATE;
  ELSE
    -- If it exists but is not the right type, alter it
    IF (
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'tasks'
      AND column_name = 'due_date'
    ) != 'date' THEN
      -- Alter the column type
      ALTER TABLE public.tasks ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
    END IF;
  END IF;
END $$;

