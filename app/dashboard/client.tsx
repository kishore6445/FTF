"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Target, Clock, Grid2X2, PlusIcon, CalendarDays, CalendarClock, LogOut } from "lucide-react"
import type { Task, Role } from "@/lib/types"
import SimplifiedTaskDialog from "@/components/simplified-task-dialog"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FourQuadrantLayout from "@/components/four-quadrant-layout"
import WeeklyTasks from "@/components/weekly-tasks"
import MonthlyTasks from "@/components/monthly-tasks"
import DailyRituals from "@/components/daily-rituals"
import BigRocks from "@/components/big-rocks"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface DashboardClientProps {
  tasks: Task[]
  roles: Role[]
  session: any
}

export default function DashboardClient({ tasks, roles, session }: DashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("quadrants")
  const { user, signOut } = useAuth()
  const [tasksArray, setTasksArray] = useState<Task[]>([])
  const [rolesArray, setRolesArray] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (Array.isArray(tasks)) {
          setTasksArray(tasks)
        } else {
          console.warn("Tasks prop is not an array. Using an empty array instead.")
          setTasksArray([])
        }

        if (Array.isArray(roles)) {
          setRolesArray(roles)
        } else {
          console.warn("Roles prop is not an array. Using an empty array instead.")
          setRolesArray([])
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [tasks, roles])

  // Filter tasks for the quadrant view
  const incompleteTasks = tasksArray.filter((task) => !task.completed)

  const handleAddTask = (quadrant: string) => {
    router.push(`/add-task?quadrant=${quadrant}`)
  }

  const handleViewAllTasks = () => {
    router.push("/task-inbox")
  }

  const handleViewWeeklyPlan = () => {
    router.push("/planner")
  }

  const handleViewMissionVision = () => {
    router.push("/mission-vision")
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Weekly Planner</h1>
        <div className="flex items-center gap-2">
          <SimplifiedTaskDialog
            roles={rolesArray}
            onTaskAdded={() => {}}
            trigger={
              <Button size="sm" className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add Task_testing
              </Button>
            }
          />
          <Button variant="outline" onClick={handleSignOut} className="gap-1">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="quadrants" className="flex items-center gap-1">
            <Grid2X2 className="h-4 w-4" />
            <span className="hidden sm:inline">Quadrants_test</span>
          </TabsTrigger>
          <TabsTrigger value="this-week" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">This Week_test</span>
          </TabsTrigger>
          <TabsTrigger value="this-month" className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            <span className="hidden sm:inline">This Month_test</span>
          </TabsTrigger>
          <TabsTrigger value="daily-rituals" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Rituals_test</span>
          </TabsTrigger>
          <TabsTrigger value="big-rocks" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Big Rocks_test</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quadrants" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <FourQuadrantLayout
              tasks={incompleteTasks}
              roles={rolesArray}
              onAddTask={handleAddTask}
              onViewAllTasks={handleViewAllTasks}
              onViewWeeklyPlan={handleViewWeeklyPlan}
              onViewMissionVision={handleViewMissionVision}
            />
          )}
        </TabsContent>

        <TabsContent value="this-week" className="mt-0">
          <WeeklyTasks tasks={incompleteTasks} roles={rolesArray} />
        </TabsContent>

        <TabsContent value="this-month" className="mt-0">
          <MonthlyTasks tasks={incompleteTasks} roles={rolesArray} />
        </TabsContent>

        <TabsContent value="daily-rituals" className="mt-0">
          <DailyRituals />
        </TabsContent>

        <TabsContent value="big-rocks" className="mt-0">
          <BigRocks />
        </TabsContent>
      </Tabs>
    </div>
  )
}

