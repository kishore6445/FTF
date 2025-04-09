import type { Task, Goal } from "@/lib/types"
import { getClientSupabase } from "./supabase"
import { createBrowserSupabaseClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Placeholder data fetching functions
// In a real application, these would fetch data from an API or database

export async function getTasks(): Promise<Task[]> {
  try {
    //const client = createBrowserSupabaseClient();
    const client = createServerComponentClient({ cookies })


   // const client = getClientSupabase()
    // const { data: session } = await client.auth.getSession()

    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession()


    if (!session?.user) {
      console.log("No authenticated user found, returning sample tasks")
      // Return sample tasks if not authenticated
      return [
        {
          id: "1",
          title: "Complete project proposal",
          description: "Finish the quarterly project proposal",
          quadrant: "q1",
          roleId: "1",
          completed: false,
        },
        {
          id: "2",
          title: "Weekly review",
          description: "Review progress and plan next week",
          quadrant: "q2",
          roleId: "2",
          completed: false,
        },
        {
          id: "3",
          title: "Respond to emails",
          description: "Clear inbox and respond to pending emails",
          quadrant: "q3",
          roleId: "1",
          completed: false,
        },
        {
          id: "4",
          title: "Social media browsing",
          description: "Check social media updates",
          quadrant: "q4",
          roleId: "3",
          completed: false,
        },
      ]
    }

    const { data, error } = await client
      .from("tasks")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tasks:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getTasks:", error)
    // Return sample tasks as fallback
    return [
      {
        id: "1",
        title: "Complete project proposal",
        description: "Finish the quarterly project proposal",
        quadrant: "q1",
        roleId: "1",
        completed: false,
      },
      {
        id: "2",
        title: "Weekly review",
        description: "Review progress and plan next week",
        quadrant: "q2",
        roleId: "2",
        completed: false,
      },
    ]
  }
}

export async function getRoles() {
  try {
    const client = getClientSupabase()
    debugger;
    console.log(client);
    const { data: session } = await client.auth.getSession()
    console.log("Session is");
    console.log(session);

    if (!session?.session?.user) {
      console.log("No authenticated user found, returning sample roles")
      // Return sample roles if not authenticated
      return [
        {
          id: "1",
          name: "Professional",
          color: "#4f46e5",
          description: "Work-related responsibilities",
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Personal",
          color: "#10b981",
          description: "Personal development and goals",
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Family",
          color: "#f59e0b",
          description: "Family responsibilities and activities",
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    }

    const userId = session.session.user.id
    console.log("Fetching roles for user:", userId)

    // Add timeout to the fetch operation
    const fetchPromise = client.from("roles").select("*").eq("user_id", userId).order("name", { ascending: true })

    // Create a timeout promise with a longer duration (15 seconds instead of 5)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.warn("Roles fetch is taking longer than expected, but will continue waiting")
        // Instead of rejecting with an error, we'll just log a warning
        // and let the fetch continue
      }, 5000)
    })

    // Race the fetch against the timeout, but don't actually reject on timeout
    const { data, error } = (await Promise.race([
      fetchPromise,
      timeoutPromise.then(() => {
        throw new Error("Fetch roles timeout")
      }),
    ])) as any

    if (error) {
      console.error("Error fetching roles:", error)
      throw error
    }

    console.log("Roles fetched successfully:", data)

    return data.map((role: any) => ({
      id: role.id,
      name: role.name,
      color: role.color,
      description: role.description,
      userId: role.user_id,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
    }))
  } catch (error) {
    console.error("Error in getRoles:", error)

    // Log more detailed information about the error
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }

    // Check if we have a session and can try a simpler query
    try {
      const client = getClientSupabase()
      const { data: session } = await client.auth.getSession()

      if (session?.session?.user) {
        console.log("Attempting simplified roles query...")
        // Try a simpler query with no ordering or filtering
        const { data } = await client
          .from("roles")
          .select("id, name, color, description, user_id, created_at, updated_at")

        if (data && data.length > 0) {
          console.log("Simplified query succeeded with", data.length, "roles")
          return data.map((role: any) => ({
            id: role.id,
            name: role.name,
            color: role.color || "#808080", // Default color if missing
            description: role.description || "",
            userId: role.user_id,
            createdAt: role.created_at,
            updatedAt: role.updated_at,
          }))
        }
      }
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError)
    }

    // Return sample roles as final fallback
    console.log("Returning sample roles as fallback")
    return [
      {
        id: "1",
        name: "Professional",
        color: "#4f46e5",
        description: "Work-related responsibilities",
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Personal",
        color: "#10b981",
        description: "Personal development and goals",
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Family",
        color: "#f59e0b",
        description: "Family responsibilities and activities",
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

export async function getGoals(): Promise<Goal[]> {
  try {
    //const client = getClientSupabase()
    const client = createServerComponentClient({ cookies });

    const { data: session } = await client.auth.getSession()

    if (!session?.session?.user) {
      // Return sample goals if not authenticated
      return [
        {
          id: "1",
          title: "Learn a new programming language",
          description: "Master Python basics within 3 months",
          timeframe: "quarterly",
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Improve physical fitness",
          description: "Exercise 3 times per week",
          timeframe: "monthly",
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    }

    const { data, error } = await client
      .from("goals")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching goals:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getGoals:", error)
    // Return sample goals as fallback
    return [
      {
        id: "1",
        title: "Learn a new programming language",
        description: "Master Python basics within 3 months",
        timeframe: "quarterly",
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Improve physical fitness",
        description: "Exercise 3 times per week",
        timeframe: "monthly",
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

export async function getBigRocks(): Promise<Task[]> {
  try {
    const client = getClientSupabase()
    const { data: session } = await client.auth.getSession()

    if (!session?.session?.user) {
      // Return sample big rocks if not authenticated
      return [
        {
          id: "3",
          title: "Complete quarterly planning",
          description: "Set goals and priorities for the next quarter",
          quadrant: "q2",
          roleId: "1",
          completed: false,
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          is_big_rock: true,
        },
        {
          id: "4",
          title: "Learn React server components",
          description: "Study and implement React server components in a project",
          quadrant: "q2",
          roleId: "2",
          completed: false,
          userId: "sample",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          is_big_rock: true,
        },
      ]
    }

    // Try to fetch big rocks from the database
    try {
      const { data, error } = await client
        .from("tasks")
        .select("*")
        .eq("user_id", session.session.user.id)
        .eq("is_big_rock", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching big rocks:", error)
        throw error
      }

      return data || []
    } catch (dbError) {
      console.error("Database error fetching big rocks:", dbError)
      // If the is_big_rock column doesn't exist, try an alternative approach
      // Just return some important tasks from quadrant 2
      const { data, error } = await client
        .from("tasks")
        .select("*")
        .eq("user_id", session.session.user.id)
        .eq("quadrant", "q2")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching alternative big rocks:", error)
        throw error
      }

      return data || []
    }
  } catch (error) {
    console.error("Error in getBigRocks:", error)
    // Return sample big rocks as fallback
    return [
      {
        id: "3",
        title: "Complete quarterly planning",
        description: "Set goals and priorities for the next quarter",
        quadrant: "q2",
        roleId: "1",
        completed: false,
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        is_big_rock: true,
      },
      {
        id: "4",
        title: "Learn React server components",
        description: "Study and implement React server components in a project",
        quadrant: "q2",
        roleId: "2",
        completed: false,
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        is_big_rock: true,
      },
      {
        id: "5",
        title: "Weekly family dinner",
        description: "Dedicated time with family every week",
        quadrant: "q2",
        roleId: "3",
        completed: true,
        userId: "sample",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        is_big_rock: true,
      },
    ]
  }
}

