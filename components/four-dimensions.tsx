"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Brain, Heart, Dumbbell, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Dimension = "physical" | "mental" | "social" | "spiritual"

type DimensionGoal = {
  id: string
  dimension: Dimension
  title: string
  description: string
  progress: number
  user_id: string
  created_at: string
  updated_at: string
}

type DimensionInfo = {
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

export function FourDimensions() {
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<DimensionGoal[]>([])
  const [activeTab, setActiveTab] = useState<Dimension>("physical")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentGoal, setCurrentGoal] = useState<DimensionGoal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    progress: 0,
  })

  const dimensionInfo: Record<Dimension, DimensionInfo> = {
    physical: {
      name: "Physical",
      description: "Exercise, nutrition, sleep, and overall physical well-being",
      icon: <Dumbbell className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    mental: {
      name: "Mental",
      description: "Learning, reading, education, and cognitive development",
      icon: <Brain className="h-6 w-6" />,
      color: "bg-yellow-500",
    },
    social: {
      name: "Social/Emotional",
      description: "Relationships, communication, empathy, and emotional intelligence",
      icon: <Users className="h-6 w-6" />,
      color: "bg-green-500",
    },
    spiritual: {
      name: "Spiritual",
      description: "Values, purpose, meditation, and connection to something greater",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-purple-500",
    },
  }

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const createDimensionGoalsTable = async () => {
    try {
      // Try direct SQL approach instead of relying on a function that might not exist
      const { error } = await supabase.rpc("run_sql", {
        sql: `
        CREATE TABLE IF NOT EXISTS public.dimension_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          dimension TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          progress INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes if they don't exist
        CREATE INDEX IF NOT EXISTS dimension_goals_user_id_idx ON public.dimension_goals(user_id);
        CREATE INDEX IF NOT EXISTS dimension_goals_dimension_idx ON public.dimension_goals(dimension);
        
        -- Set up RLS policies
        ALTER TABLE public.dimension_goals ENABLE ROW LEVEL SECURITY;
        
        -- Create policies (will fail silently if they already exist)
        DO $$
        BEGIN
          BEGIN
            CREATE POLICY "Users can view their own dimension goals"
              ON public.dimension_goals
              FOR SELECT
              USING (auth.uid() = user_id);
          EXCEPTION WHEN duplicate_object THEN
            NULL;
          END;
          
          BEGIN
            CREATE POLICY "Users can insert their own dimension goals"
              ON public.dimension_goals
              FOR INSERT
              WITH CHECK (auth.uid() = user_id);
          EXCEPTION WHEN duplicate_object THEN
            NULL;
          END;
          
          BEGIN
            CREATE POLICY "Users can update their own dimension goals"
              ON public.dimension_goals
              FOR UPDATE
              USING (auth.uid() = user_id);
          EXCEPTION WHEN duplicate_object THEN
            NULL;
          END;
          
          BEGIN
            CREATE POLICY "Users can delete their own dimension goals"
              ON public.dimension_goals
              FOR DELETE
              USING (auth.uid() = user_id);
          EXCEPTION WHEN duplicate_object THEN
            NULL;
          END;
        END $$;
      `,
      })

      if (error) {
        // If run_sql is not available, try a simpler approach
        console.error("Error creating table with run_sql:", error)

        // Fallback to a simple insert that will create the table if it doesn't exist
        await supabase
          .from("dimension_goals")
          .insert({
            id: "00000000-0000-0000-0000-000000000000",
            user_id: user?.id,
            dimension: "physical",
            title: "Table initialization",
            description: "This is a dummy record to ensure the table exists",
            progress: 0,
          })
          .select()

        // Then delete the dummy record
        await supabase.from("dimension_goals").delete().eq("id", "00000000-0000-0000-0000-000000000000")
      }
    } catch (error) {
      console.error("Error creating dimension_goals table:", error)
      // Continue execution even if table creation fails
      // The fetchGoals function will handle the case where the table doesn't exist
    }
  }

  // Also update the fetchGoals function to handle errors better:

  const fetchGoals = async () => {
    try {
      setLoading(true)

      // Check if the dimension_goals table exists
      const { data: tableExists, error: tableCheckError } = await supabase
        .from("dimension_goals")
        .select("id")
        .limit(1)
        .maybeSingle()

      // If table doesn't exist or there's an error, try to create it
      if (tableCheckError) {
        console.log("Table check error, attempting to create table:", tableCheckError.message)
        await createDimensionGoalsTable()
      }

      // Now fetch the goals, with better error handling
      const { data, error } = await supabase
        .from("dimension_goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching goals after table creation:", error)
        // Set empty goals array if there's an error
        setGoals([])
      } else {
        setGoals(data || [])
      }
    } catch (error) {
      console.error("Error in fetchGoals:", error)
      toast({
        title: "Error fetching goals",
        description: "Please try again later.",
        variant: "destructive",
      })
      // Set empty goals array if there's an error
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your goal.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("dimension_goals")
        .insert({
          user_id: user?.id,
          dimension: activeTab,
          title: newGoal.title,
          description: newGoal.description,
          progress: newGoal.progress,
        })
        .select()

      if (error) throw error

      setGoals([...(data || []), ...goals])
      setNewGoal({ title: "", description: "", progress: 0 })
      setIsAddDialogOpen(false)

      toast({
        title: "Goal added",
        description: "Your goal has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error adding goal",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleEditGoal = async () => {
    if (!currentGoal || !currentGoal.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your goal.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("dimension_goals")
        .update({
          title: currentGoal.title,
          description: currentGoal.description,
          progress: currentGoal.progress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentGoal.id)

      if (error) throw error

      setGoals(goals.map((goal) => (goal.id === currentGoal.id ? { ...goal, ...currentGoal } : goal)))
      setIsEditDialogOpen(false)

      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error updating goal",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const { error } = await supabase.from("dimension_goals").delete().eq("id", id)

      if (error) throw error

      setGoals(goals.filter((goal) => goal.id !== id))

      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error deleting goal",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleProgressUpdate = async (id: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("dimension_goals")
        .update({
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      setGoals(goals.map((goal) => (goal.id === id ? { ...goal, progress } : goal)))
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error updating progress",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const filteredGoals = goals.filter((goal) => goal.dimension === activeTab)

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Four Dimensions</h1>
          <p className="text-muted-foreground mt-1">
            Balance your life across physical, mental, social, and spiritual dimensions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Dimension)} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          {Object.entries(dimensionInfo).map(([key, info]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              {info.icon}
              <span className="hidden sm:inline">{info.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(dimensionInfo).map(([key, info]) => (
          <TabsContent key={key} value={key} className="mt-0">
            <Card className="mb-6 border-l-4" style={{ borderLeftColor: info.color.replace("bg-", "") }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {info.icon}
                  {info.name} Dimension
                </CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGoals.length > 0 ? (
              <div className="space-y-4">
                {filteredGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{goal.title}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentGoal(goal)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Created: {new Date(goal.created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm mb-4">{goal.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-between w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProgressUpdate(goal.id, Math.max(0, goal.progress - 10))}
                          disabled={goal.progress <= 0}
                        >
                          -10%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProgressUpdate(goal.id, Math.min(100, goal.progress + 10))}
                          disabled={goal.progress >= 100}
                        >
                          +10%
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No goals added for this dimension yet</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>Create a new goal for the {dimensionInfo[activeTab].name} dimension</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Enter goal title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Enter goal description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="progress" className="text-sm font-medium">
                Initial Progress: {newGoal.progress}%
              </label>
              <input
                id="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                value={newGoal.progress}
                onChange={(e) => setNewGoal({ ...newGoal, progress: Number.parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update your goal details</DialogDescription>
          </DialogHeader>
          {currentGoal && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="edit-title"
                  value={currentGoal.title}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  value={currentGoal.description}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-progress" className="text-sm font-medium">
                  Progress: {currentGoal.progress}%
                </label>
                <input
                  id="edit-progress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentGoal.progress}
                  onChange={(e) =>
                    setCurrentGoal({
                      ...currentGoal,
                      progress: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FourDimensions

