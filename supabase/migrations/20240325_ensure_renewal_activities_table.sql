-- Create a function to create the renewal_activities table if it doesn't exist
CREATE OR REPLACE FUNCTION create_renewal_activities_table()
RETURNS void AS $$
BEGIN
-- Check if the table already exists
IF NOT EXISTS (
SELECT FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'renewal_activities'
) THEN
-- Create renewal_activities table
CREATE TABLE public.renewal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('physical', 'social', 'mental', 'spiritual')),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  completed_dates TEXT[] DEFAULT '{}',
  target_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.renewal_activities ENABLE ROW LEVEL SECURITY;

-- Policy for selecting own renewal activities
CREATE POLICY select_own_renewal_activities ON public.renewal_activities
FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting own renewal activities
CREATE POLICY insert_own_renewal_activities ON public.renewal_activities
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating own renewal activities
CREATE POLICY update_own_renewal_activities ON public.renewal_activities
FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting own renewal activities
CREATE POLICY delete_own_renewal_activities ON public.renewal_activities
FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_renewal_activities_user_id ON public.renewal_activities(user_id);
CREATE INDEX idx_renewal_activities_dimension ON public.renewal_activities(dimension);
END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create the table
SELECT create_renewal_activities_table();

