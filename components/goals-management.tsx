"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Plus, Edit, Trash2, Calendar } from "lucide-react"
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { Goal } from "@/lib/types"
import { cn } from "@/lib/utils"

interface GoalsManagementProps {
  goals: Goal[]
  addGoal: (goal: Omit<Goal, "id">) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (goalId: string) => void
}

export default function GoalsManagement({ goals, addGoal, updateGoal, deleteGoal }: GoalsManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    title: "",
    description: "",
    timeframe: "weekly",
  })
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Get current date ranges
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const quarterStart = startOfQuarter(now)
  const quarterEnd = endOfQuarter(now)
  const yearStart = startOfYear(now)
  const yearEnd = endOfYear(now)

  // Filter goals by timeframe
  const weeklyGoals = goals.filter((goal) => goal.timeframe === "weekly")
  const monthlyGoals = goals.filter((goal) => goal.timeframe === "monthly")
  const quarterlyGoals = goals.filter((goal) => goal.timeframe === "quarterly")
  const yearlyGoals = goals.filter((goal) => goal.timeframe === "yearly")

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return
    addGoal({
      ...newGoal,
      deadline: date ? format(date, "yyyy-MM-dd") : undefined,
    })
    setNewGoal({
      title: "",
      description: "",
      timeframe: "weekly",
    })
    setDate(undefined)
    setIsAddDialogOpen(false)
  }

  const handleEditGoal = () => {
    if (!editingGoal || !editingGoal.title.trim()) return
    updateGoal({
      ...editingGoal,
      deadline: date ? format(date, "yyyy-MM-dd") : undefined,
    })
    setEditingGoal(null)
    setDate(undefined)
    setIsEditDialogOpen(false)
  }

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal)
    setDate(goal.deadline ? parseISO(goal.deadline) : undefined)
    setIsEditDialogOpen(true)
  }

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{goal.title}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(goal)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => deleteGoal(goal.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>

      {goal.description && <p className="text-sm text-gray-500 mt-2">{goal.description}</p>}

      {goal.deadline && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>Due: {format(parseISO(goal.deadline), "MMM d, yyyy")}</span>
        </div>
      )}
    </div>
  )

  const GoalSection = ({
    title,
    timeframe,
    dateRange,
    goals,
    addButtonText,
  }: {
    title: string
    timeframe: "weekly" | "monthly" | "quarterly" | "yearly"
    dateRange: string
    goals: Goal[]
    addButtonText: string
  }) => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {title} <span className="text-gray-500 text-base font-normal">({dateRange})</span>
        </h2>
        <Button
          variant="default"
          className="bg-black hover:bg-black/90"
          onClick={() => {
            setNewGoal((prev) => ({ ...prev, timeframe }))
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      </div>
      <div className="border rounded-lg p-6">
        {goals.length === 0 ? (
          <div className="text-center space-y-3 py-6">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500">
              No {timeframe} goals yet. Add your first {timeframe} goal to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </section>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <GoalSection
        title="Weekly Goals"
        timeframe="weekly"
        dateRange={`${format(weekStart, "MMM d, yyyy")} - ${format(weekEnd, "MMM d, yyyy")}`}
        goals={weeklyGoals}
        addButtonText="Add Weekly Goal"
      />

      <GoalSection
        title="Monthly Goals"
        timeframe="monthly"
        dateRange={`${format(monthStart, "MMM d, yyyy")} - ${format(monthEnd, "MMM d, yyyy")}`}
        goals={monthlyGoals}
        addButtonText="Add Monthly Goal"
      />

      <GoalSection
        title="Quarterly Goals"
        timeframe="quarterly"
        dateRange={`${format(quarterStart, "MMM d, yyyy")} - ${format(quarterEnd, "MMM d, yyyy")}`}
        goals={quarterlyGoals}
        addButtonText="Add Quarterly Goal"
      />

      <GoalSection
        title="Yearly Goals"
        timeframe="yearly"
        dateRange={`${format(yearStart, "MMM d, yyyy")} - ${format(yearEnd, "MMM d, yyyy")}`}
        goals={yearlyGoals}
        addButtonText="Add Yearly Goal"
      />

      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Enter your goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Add more details about your goal"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
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
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Goal Title</Label>
                <Input
                  id="edit-title"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  placeholder="Enter your goal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  placeholder="Add more details about your goal"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="edit-deadline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
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

