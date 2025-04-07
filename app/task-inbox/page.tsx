//"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getTasks, getRoles } from "@/lib/data"
import TaskInboxClientWrapper from "./TaskInboxClientWrapper"

export default function TaskInboxPage() {
  return (
    <div className="container py-6">
      <Suspense fallback={<TaskInboxSkeleton />}>
        <TaskInboxContent />
      </Suspense>
    </div>
  )
}

async function TaskInboxContent() {
  try {
    // Add error handling around data fetching
    const tasksPromise = getTasks().catch((error) => {
      console.error("Error fetching tasks:", error)
      return [] // Return empty array as fallback
    })

    const rolesPromise = getRoles().catch((error) => {
      console.error("Error fetching roles:", error)
      return [] // Return empty array as fallback
    })

    // Wait for both promises to resolve
    const [tasks, roles] = await Promise.all([tasksPromise, rolesPromise])

    return <TaskInboxClientWrapper initialTasks={tasks} initialRoles={roles} />
  } catch (error) {
    console.error("Error in TaskInboxContent:", error)
    // Return a fallback UI with error message
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">Error loading task data. Please try again later.</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }
}

function TaskInboxSkeleton() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

