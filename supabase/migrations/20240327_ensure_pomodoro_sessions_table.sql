-- Create the pomodoro_sessions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pomodoro_sessions') THEN
        CREATE TABLE public.pomodoro_sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
            task_title TEXT NOT NULL,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            duration INTEGER NOT NULL, -- Duration in seconds
            completed BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Add RLS policies
        ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

        -- Policy for select
        CREATE POLICY "Users can view their own pomodoro sessions"
            ON public.pomodoro_sessions
            FOR SELECT
            USING (auth.uid() = user_id);

        -- Policy for insert
        CREATE POLICY "Users can insert their own pomodoro sessions"
            ON public.pomodoro_sessions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Policy for update
        CREATE POLICY "Users can update their own pomodoro sessions"
            ON public.pomodoro_sessions
            FOR UPDATE
            USING (auth.uid() = user_id);

        -- Policy for delete
        CREATE POLICY "Users can delete their own pomodoro sessions"
            ON public.pomodoro_sessions
            FOR DELETE
            USING (auth.uid() = user_id);

        -- Add indexes
        CREATE INDEX pomodoro_sessions_user_id_idx ON public.pomodoro_sessions(user_id);
        CREATE INDEX pomodoro_sessions_task_id_idx ON public.pomodoro_sessions(task_id);
        CREATE INDEX pomodoro_sessions_start_time_idx ON public.pomodoro_sessions(start_time);
    END IF;
END
$$;

