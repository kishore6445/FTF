"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Target, Info, CheckCircle } from "lucide-react"
import TaskCard from "@/components/task-card"
import type { Task, Role } from "@/lib/types"

interface SimplifiedBigRocksProps {
  tasks: Task[]
  roles: Role[]
  onAddBigRock: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string) => void
  onToggleSubtaskCompletion: (taskId: string, subtaskId: string) => void
}

export default function SimplifiedBigRocks({
  tasks,
  roles,
  onAddBigRock,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
  onToggleSubtaskCompletion,
}: SimplifiedBigRocksProps) {
  const [activeTab, setActiveTab] = useState("active")
  const [showHelp, setShowHelp] = useState(false)

  // Filter big rocks
  const activeBigRocks = tasks.filter((task) => task.is_big_rock && !task.completed)
  const completedBigRocks = tasks.filter((task) => task.is_big_rock && task.completed)

  // Calculate completion percentage
  const totalBigRocks = activeBigRocks.length + completedBigRocks.length
  const completionPercentage = totalBigRocks > 0 ? Math.round((completedBigRocks.length / totalBigRocks) * 100) : 0

  // Get role by ID
  const getRoleById = (roleId?: string) => {
    if (!roleId) return undefined
    return roles.find((role) => role.id === roleId)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Big Rocks</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)}>
            <Info className="h-4 w-4 mr-1" />
            {showHelp ? "Hide" : "Show"} Help
          </Button>
          <Button onClick={onAddBigRock} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Big Rock
          </Button>
        </div>
      </div>

      {showHelp && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">What are Big Rocks?</h3>
            <p className="text-sm mb-2">
              In Stephen Covey's time management philosophy, "big rocks" represent your most important priorities.
            </p>
            <p className="text-sm mb-2">
              The concept comes from a demonstration where if you fill a jar with sand first (small tasks), you won't
              have room for the big rocks (important priorities). But if you put the big rocks in first, the sand can
              fill in around them.
            </p>
            <p className="text-sm font-medium">
              Focus on your big rocks first to ensure your most important priorities get done.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Big Rocks Progress</h2>
              <p className="text-sm text-muted-foreground">
                {completedBigRocks.length} of {totalBigRocks} completed
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <Progress value={completionPercentage} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0%</span>
                <span>{completionPercentage}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Active ({activeBigRocks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedBigRocks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeBigRocks.length > 0 ? (
            <div className="space-y-3">
              {activeBigRocks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  role={getRoleById(task.roleId)}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleCompletion={onToggleTaskCompletion}
                  onToggleSubtaskCompletion={onToggleSubtaskCompletion}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No active big rocks</p>
              <Button onClick={onAddBigRock} variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Big Rock
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedBigRocks.length > 0 ? (
            <div className="space-y-3">
              {completedBigRocks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  role={getRoleById(task.roleId)}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleCompletion={onToggleTaskCompletion}
                  onToggleSubtaskCompletion={onToggleSubtaskCompletion}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed big rocks yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

