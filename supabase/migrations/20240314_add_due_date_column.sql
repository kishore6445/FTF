-- Add due_date column to tasks table if it doesn't exist
ALTER TABLE IF EXISTS public.tasks 
ADD COLUMN IF NOT EXISTS due_date DATE;

