-- Add task_id column to big_rocks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'big_rocks' AND column_name = 'task_id'
    ) THEN
        ALTER TABLE big_rocks ADD COLUMN task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add task_id column to mission_items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mission_items' AND column_name = 'task_id'
    ) THEN
        ALTER TABLE mission_items ADD COLUMN task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add is_big_rock column to tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'is_big_rock'
    ) THEN
        ALTER TABLE tasks ADD COLUMN is_big_rock BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_mission_item column to tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'is_mission_item'
    ) THEN
        ALTER TABLE tasks ADD COLUMN is_mission_item BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add ritual_type column to mission_items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mission_items' AND column_name = 'ritual_type'
    ) THEN
        ALTER TABLE mission_items ADD COLUMN ritual_type TEXT;
    END IF;
END $$;

-- Add start_time and end_time columns to mission_items table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mission_items' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE mission_items ADD COLUMN start_time TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mission_items' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE mission_items ADD COLUMN end_time TEXT;
    END IF;
END $$;

