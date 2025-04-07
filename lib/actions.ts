"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function toggleTaskComplete(taskId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data: task, error } = await supabase.from("tasks").select("completed").eq("id", taskId).single()

  if (error) {
    console.error("Error fetching task:", error)
    return
  }

  const newCompletedState = !task.completed

  const { error: updateError } = await supabase.from("tasks").update({ completed: newCompletedState }).eq("id", taskId)

  if (updateError) {
    console.error("Error updating task:", updateError)
    return
  }

  revalidatePath("/dashboard")
}

