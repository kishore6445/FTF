-- First check if the ritual_completions table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ritual_completions') THEN
        -- Create the ritual_completions table if it doesn't exist
        CREATE TABLE public.ritual_completions (
            id UUID PRIMARY KEY,
            ritual_id UUID NOT NULL,
            date DATE NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            missed BOOLEAN DEFAULT FALSE,
            user_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own ritual completions"
            ON public.ritual_completions
            FOR SELECT
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert their own ritual completions"
            ON public.ritual_completions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own ritual completions"
            ON public.ritual_completions
            FOR UPDATE
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can delete their own ritual completions"
            ON public.ritual_completions
            FOR DELETE
            USING (auth.uid() = user_id);
    ELSE
        -- Check if the missed column exists in ritual_completions
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ritual_completions' 
            AND column_name = 'missed'
        ) THEN
            -- Add the missed column if it doesn't exist
            ALTER TABLE public.ritual_completions ADD COLUMN missed BOOLEAN DEFAULT FALSE;
        END IF;
    END IF;
    
    -- Check if the days_of_week column exists in mission_items
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mission_items'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mission_items' 
        AND column_name = 'days_of_week'
    ) THEN
        -- Add the days_of_week column if it doesn't exist
        ALTER TABLE public.mission_items ADD COLUMN days_of_week TEXT[] DEFAULT NULL;
    END IF;
END
$$;

-- Create or replace the function to create ritual_completions table
CREATE OR REPLACE FUNCTION public.create_ritual_completions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create the ritual_completions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.ritual_completions (
        id UUID PRIMARY KEY,
        ritual_id UUID NOT NULL,
        date DATE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        missed BOOLEAN DEFAULT FALSE,
        user_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies if they don't exist
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'ritual_completions' 
        AND schemaname = 'public' 
        AND policyname = 'Users can view their own ritual completions'
    ) THEN
        ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own ritual completions"
            ON public.ritual_completions
            FOR SELECT
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert their own ritual completions"
            ON public.ritual_completions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own ritual completions"
            ON public.ritual_completions
            FOR UPDATE
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can delete their own ritual completions"
            ON public.ritual_completions
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END;
$$;

