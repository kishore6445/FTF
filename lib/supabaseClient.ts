import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// This client is safe to use in client components
// It uses the createClientComponentClient which doesn't need direct access to the anon key
export const supabase = createClientComponentClient()

// For server components only
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Add missing import
import { createClient } from "@supabase/supabase-js"

