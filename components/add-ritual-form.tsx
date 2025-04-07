"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { uuidv4 } from "@/lib/supabase"

interface AddRitualFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddRitualForm({ open, onOpenChange, onSuccess }: AddRitualFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeOfDay, setTimeOfDay] = useState("morning")
  const [category, setCategory] = useState("general")
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your ritual",
        variant: "destructive",
      })
      return
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Days required",
        description: "Please select at least one day of the week",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // First, check if the rituals table exists
      const { error: tableCheckError } = await supabase
        .from("rituals")
        .select("id")
        .limit(1)
        .catch((err) => {
          console.log("Table check error:", err)
          return { error: err }
        })

      if (tableCheckError) {
        // Table doesn't exist, show error
        toast({
          title: "Database not ready",
          description: "The rituals table doesn't exist yet. Please run the database migrations first.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase.from("rituals").insert({
        id: uuidv4(),
        title,
        description: description || null,
        user_id: user?.id,
        time_of_day: timeOfDay,
        category,
        days_of_week: selectedDays,
      })

      if (error) {
        console.error("Error creating ritual:", error)
        toast({
          title: "Error",
          description: "Failed to create ritual. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Ritual created",
        description: "Your new ritual has been added",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setTimeOfDay("morning")
      setCategory("general")
      setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"])

      // Close dialog and refresh data
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Ritual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning meditation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="10 minutes of mindfulness to start the day"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Time of Day</Label>
            <RadioGroup value={timeOfDay} onValueChange={setTimeOfDay} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="morning" />
                <Label htmlFor="morning">Morning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="afternoon" />
                <Label htmlFor="afternoon">Afternoon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evening" id="evening" />
                <Label htmlFor="evening">Evening</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup value={category} onValueChange={setCategory} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">General</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="health" id="health" />
                <Label htmlFor="health">Health</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work">Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal">Personal</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="grid grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={day.id}>{day.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Ritual"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

