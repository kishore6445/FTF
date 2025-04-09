import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SimplifiedTaskForm from "@/components/simplified-task-form"
import { getRoles } from "@/lib/data"
import { TasksProvider } from "@/contexts/tasks-context"

export default function AddTaskPage() {
  return (
    <div className="container py-6">
      <Suspense fallback={<AddTaskSkeleton />}>
        <AddTaskContent />
      </Suspense>
    </div>
  )
}

async function AddTaskContent() {
  //const roles = await getRoles()

  //console.log("Fetched roles:", roles)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <TasksProvider>
          <SimplifiedTaskForm roles={roles} />
        </TasksProvider> */}
      </CardContent>
    </Card>
  )
}

function AddTaskSkeleton() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

