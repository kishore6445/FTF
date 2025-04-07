-- Add days_of_week column to mission_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mission_items' AND column_name = 'days_of_week'
    ) THEN
        ALTER TABLE mission_items ADD COLUMN days_of_week TEXT[] DEFAULT NULL;
    END IF;
END $$;

-- Add streak_goal column to mission_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mission_items' AND column_name = 'streak_goal'
    ) THEN
        ALTER TABLE mission_items ADD COLUMN streak_goal INTEGER DEFAULT 21;
    END IF;
END $$;

-- Add is_habit column to tasks if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'is_habit'
    ) THEN
        ALTER TABLE tasks ADD COLUMN is_habit BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index on is_habit column for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'tasks' AND indexname = 'tasks_is_habit_idx'
    ) THEN
        CREATE INDEX tasks_is_habit_idx ON tasks(is_habit);
    END IF;
END $$;

