import { supabase } from "@/lib/supabase"

export async function setupWeeklyPlannerTables() {
  try {
    // Execute the SQL migration
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        -- Create weekly plans table
        CREATE TABLE IF NOT EXISTS weekly_plans (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          week_start_date DATE NOT NULL,
          week_end_date DATE NOT NULL,
          theme TEXT,
          reflection TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, week_start_date)
        );

        -- Create big rocks table for weekly planning
        CREATE TABLE IF NOT EXISTS weekly_big_rocks (
          id UUID PRIMARY KEY,
          weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
          quadrant TEXT,
          priority INTEGER DEFAULT 1,
          completed BOOLEAN DEFAULT FALSE,
          task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create daily plans table
        CREATE TABLE IF NOT EXISTS daily_plans (
          id UUID PRIMARY KEY,
          weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          morning_review TEXT,
          evening_reflection TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        );

        -- Create time blocks table
        CREATE TABLE IF NOT EXISTS time_blocks (
          id UUID PRIMARY KEY,
          daily_plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          category TEXT,
          completed BOOLEAN DEFAULT FALSE,
          task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE weekly_big_rocks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

        -- Weekly plans policies
        CREATE POLICY IF NOT EXISTS "Users can view their own weekly plans"
        ON weekly_plans FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can create their own weekly plans"
        ON weekly_plans FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own weekly plans"
        ON weekly_plans FOR UPDATE
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own weekly plans"
        ON weekly_plans FOR DELETE
        USING (auth.uid() = user_id);

        -- Weekly big rocks policies
        CREATE POLICY IF NOT EXISTS "Users can view their own weekly big rocks"
        ON weekly_big_rocks FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can create their own weekly big rocks"
        ON weekly_big_rocks FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own weekly big rocks"
        ON weekly_big_rocks FOR UPDATE
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own weekly big rocks"
        ON weekly_big_rocks FOR DELETE
        USING (auth.uid() = user_id);

        -- Daily plans policies
        CREATE POLICY IF NOT EXISTS "Users can view their own daily plans"
        ON daily_plans FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can create their own daily plans"
        ON daily_plans FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own daily plans"
        ON daily_plans FOR UPDATE
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own daily plans"
        ON daily_plans FOR DELETE
        USING (auth.uid() = user_id);

        -- Time blocks policies
        CREATE POLICY IF NOT EXISTS "Users can view their own time blocks"
        ON time_blocks FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can create their own time blocks"
        ON time_blocks FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own time blocks"
        ON time_blocks FOR UPDATE
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own time blocks"
        ON time_blocks FOR DELETE
        USING (auth.uid() = user_id);
      `,
    })

    if (error) throw error

    return { success: true, error: null }
  } catch (error: any) {
    console.error("Error setting up weekly planner tables:", error)
    return {
      success: false,
      error: error.message || "Failed to set up weekly planner tables",
    }
  }
}

// Function to check if weekly planner tables exist
export async function checkWeeklyPlannerTablesExist() {
  try {
    // Try to query the weekly_plans table
    const { error } = await supabase.from("weekly_plans").select("count").limit(1)

    // If there's no error, the table exists
    if (!error) {
      return { exists: true, error: null }
    }

    // If the error is about the relation not existing, the table doesn't exist
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      return { exists: false, error: null }
    }

    // For other errors, log them and assume the table might not exist
    console.error("Error checking if tables exist:", error)
    return { exists: false, error: error.message }
  } catch (error: any) {
    console.error("Error checking if tables exist:", error)
    return { exists: false, error: error.message || "Failed to check if tables exist" }
  }
}

