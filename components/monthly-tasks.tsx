"use client"
export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Role } from "@/lib/types"

interface MonthlyTasksProps {
  tasks: Task[]
  roles: Role[]
}

const MonthlyTasks = ({ tasks, roles }: MonthlyTasksProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month's Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Monthly Tasks</div>
      </CardContent>
    </Card>
  )
}

export default MonthlyTasks

