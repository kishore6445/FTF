"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/hooks/use-dashboard"
import { BookOpen } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import type { Task, Role } from "@/lib/types"
import { useEffect, useState } from "react"

interface DashboardProps {
  tasks: Task[]
  roles: Role[]
}

const Dashboard = ({ tasks, roles }: DashboardProps) => {
  const router = useRouter()
  const { courses, sales } = useDashboard()
  const [tasksArray, setTasksArray] = useState<Task[]>([])

  useEffect(() => {
    if (Array.isArray(tasks)) {
      setTasksArray(tasks)
    } else {
      console.warn("Tasks prop is not an array. Using an empty array instead.")
      setTasksArray([])
    }
  }, [tasks])

  return (
    <div>
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>Here are the latest stats for your products.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Add Franklin Planner button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => router.push("/franklin-covey")}
            >
              <BookOpen className="h-4 w-4" />7 Habits
            </Button>
            {/** rest of code here */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

