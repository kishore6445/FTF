"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DailyRituals from "@/components/daily-rituals"
import MissionValuesSection from "@/components/mission-values-section"
import { useTasks } from "@/contexts/tasks-context"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import AddRitualDialog from "@/components/add-ritual-dialog"

export default function MissionVisionClientWrapper() {
  const [activeTab, setActiveTab] = useState("daily-rituals")
  const [error, setError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const { tasks, toggleTaskComplete, deleteTask, loading: tasksLoading } = useTasks()
  const { user } = useAuth()

  // Filter tasks that are rituals
  const ritualTasks = tasks.filter((task) => task.isRitual)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mission & Vision</h1>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-black hover:bg-black/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Ritual
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="daily-rituals"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-2"
            >
              Daily Rituals
            </TabsTrigger>
            <TabsTrigger
              value="mission-values"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-2"
            >
              Mission & Values
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily-rituals" className="mt-6">
            <DailyRituals tasks={ritualTasks} onToggleTaskCompletion={toggleTaskComplete} onDeleteTask={deleteTask} />
          </TabsContent>

          <TabsContent value="mission-values" className="mt-6">
            <MissionValuesSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Move the Dialog outside of the button click handler */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <AddRitualDialog onClose={() => setAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

