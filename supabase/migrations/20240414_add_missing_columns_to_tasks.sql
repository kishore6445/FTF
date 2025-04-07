-- Function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute SQL safely
CREATE OR REPLACE FUNCTION execute_sql(sql_string text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_big_rock column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tasks'
    AND column_name = 'is_big_rock'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_big_rock BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add is_mission_item column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tasks'
    AND column_name = 'is_mission_item'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_mission_item BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add priority column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tasks'
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'C3';
  END IF;
END $$;

