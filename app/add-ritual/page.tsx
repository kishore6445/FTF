"use client"

import type React from "react"

import { useState, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { TasksContext } from "@/contexts/tasks-context"
import { format } from "date-fns"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddRitualPage() {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const tasksContext = useContext(TasksContext)
  const refreshTasks = tasksContext?.refreshTasks
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter a ritual name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const ritualId = uuidv4()
      const now = new Date().toISOString()
      const todayStr = format(new Date(), "yyyy-MM-dd")

      // Add to mission_items table
      const { error } = await supabase.from("mission_items").insert({
        id: ritualId,
        title: name.trim(),
        completed: false,
        priority: 1,
        type: "ritual",
        ritual_type: "personal",
        user_id: user.id,
        created_at: now,
        updated_at: now,
      })

      if (error) throw error

      // Also create a task in the Q2 quadrant for today
      const taskId = uuidv4()
      const { error: taskError } = await supabase.from("tasks").insert({
        id: taskId,
        title: name.trim(),
        description: `Daily ritual: ${name.trim()}`,
        quadrant: "q2", // Always in Q2
        completed: false,
        time_spent: 0,
        user_id: user.id,
        created_at: now,
        updated_at: now,
        due_date: todayStr,
        is_ritual: true,
        is_mission_item: true,
      })

      if (taskError) throw taskError

      // Create a completion record for today
      await supabase.from("ritual_completions").insert({
        id: uuidv4(),
        ritual_id: ritualId,
        date: todayStr,
        completed: false,
        missed: false,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      })

      // Refresh tasks
      if (refreshTasks) {
        refreshTasks()
      }

      toast({
        title: "Ritual added",
        description: "Your new ritual has been added successfully.",
      })

      // Reset form and navigate back
      setName("")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error adding ritual:", error)
      toast({
        title: "Error adding ritual",
        description: error.message || "Failed to add ritual. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Ritual</CardTitle>
          <CardDescription>Create a new daily ritual to track.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ritual Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning Meditation"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Ritual"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

