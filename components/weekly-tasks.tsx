"use client"
export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Role } from "@/lib/types"

interface WeeklyTasksProps {
  tasks: Task[]
  roles: Role[]
}

const WeeklyTasks = ({ tasks, roles }: WeeklyTasksProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week's Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Weekly Tasks</div>
      </CardContent>
    </Card>
  )
}

export default WeeklyTasks

