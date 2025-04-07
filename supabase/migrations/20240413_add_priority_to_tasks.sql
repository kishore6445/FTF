-- Add priority column to tasks table
DO $$
BEGIN
    -- Check if priority column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'priority'
    ) THEN
        -- Add priority column
        ALTER TABLE tasks ADD COLUMN priority VARCHAR(10);
        
        -- Add comment
        COMMENT ON COLUMN tasks.priority IS 'Priority level for the task (e.g., A1, A2, B1, etc.)';
    END IF;
END $$;

