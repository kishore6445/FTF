-- Create the daily_schedule table
CREATE TABLE IF NOT EXISTS public.daily_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    task TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.daily_schedule ENABLE ROW LEVEL SECURITY;

-- Policy for selecting own schedule items
CREATE POLICY "Users can view their own schedule items"
    ON public.daily_schedule
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for inserting own schedule items
CREATE POLICY "Users can insert their own schedule items"
    ON public.daily_schedule
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for updating own schedule items
CREATE POLICY "Users can update their own schedule items"
    ON public.daily_schedule
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for deleting own schedule items
CREATE POLICY "Users can delete their own schedule items"
    ON public.daily_schedule
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS daily_schedule_user_id_date_idx ON public.daily_schedule(user_id, date);

