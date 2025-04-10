import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Re-export createClient from Supabase
export { supabaseCreateClient as createClient }

// Check if the environment variables are correctly loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env file.")
}

//Create a Supabase client for use in browser components
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: supabaseUrl || "",
  supabaseKey: supabaseAnonKey || "",
})


// Function to generate a valid UUID v4
export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Mock mode is always disabled
export const isMockMode = () => false
export const enableMockMode = () => console.warn("Mock mode is permanently disabled")
export const disableMockMode = () => console.warn("Mock mode is permanently disabled")

// Update the checkSupabaseConnection function to handle network errors better
// and implement a retry mechanism
export const checkSupabaseConnection = async (retryCount = 0, maxRetries = 3) => {
  try {
    // Use a simple query with a Promise.race for timeout
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))

    // Wrap the query in a try-catch to handle network errors
    const queryPromise = (async () => {
      try {
        return await supabase.from("tasks").select("count").limit(1)
      } catch (error) {
        console.error("Supabase query error:", error)
        throw error
      }
    })()

    const result = (await Promise.race([queryPromise, timeoutPromise])) as any

    if (result.error) {
      console.warn("Supabase connection check failed:", result.error)

      // If we haven't exceeded max retries, try again with exponential backoff
      if (retryCount < maxRetries) {
        const backoffTime = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`Retrying connection in ${backoffTime}ms (attempt ${retryCount + 1}/${maxRetries})`)

        await new Promise((resolve) => setTimeout(resolve, backoffTime))
        return checkSupabaseConnection(retryCount + 1, maxRetries)
      }

      return {
        connected: false,
        tablesExist: false,
        error: result.error.message || "Database error",
      }
    }

    return {
      connected: true,
      tablesExist: true,
      message: "Successfully connected to Supabase",
    }
  } catch (error: any) {
    console.warn("Supabase connection check error:", error)

    // If the error is a network error, provide a more specific message
    const errorMessage = error.message || "Connection error"
    const isNetworkError =
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("Network Error") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout")

    // If we haven't exceeded max retries, try again with exponential backoff
    if (retryCount < maxRetries) {
      const backoffTime = Math.pow(2, retryCount) * 1000 // Exponential backoff
      console.log(`Retrying connection in ${backoffTime}ms (attempt ${retryCount + 1}/${maxRetries})`)

      await new Promise((resolve) => setTimeout(resolve, backoffTime))
      return checkSupabaseConnection(retryCount + 1, maxRetries)
    }

    return {
      connected: false,
      tablesExist: false,
      error: isNetworkError
        ? "Network connection error. Please check your internet connection and try again."
        : errorMessage,
    }
  }
}


// Simplified database setup function
export const setupDatabase = async () => {
  const logs: string[] = []

  try {
    logs.push("Checking connection to Supabase...")
    const connectionCheck = await checkSupabaseConnection()

    if (!connectionCheck.connected) {
      logs.push("❌ Failed to connect to Supabase. Please check your connection settings.")
      return { success: false, logs }
    }

    logs.push("✅ Successfully connected to Supabase.")
    return { success: true, logs }
  } catch (error: any) {
    logs.push(`Error during setup: ${error.message || "Unknown error"}`)
    return { success: false, logs }
  }
}

// Helper function to execute with timeout
export async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)),
  ])
}

// Add this function to check if a table exists
export const checkTableExists = async (tableName: string) => {
  try {
    // Query the information schema to check if the table exists
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName)
      .single()

    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error)
      return false
    }

    return !!data
  } catch (error) {
    console.error(`Error in checkTableExists for ${tableName}:`, error)
    return false
  }
}

// Function to get the client component instance
export function getClientSupabase() {
  return supabase
}

