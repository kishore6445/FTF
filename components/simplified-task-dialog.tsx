"use client"
export const dynamic = "force-dynamic";

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Plus, Target, Clock, ListTodo, Compass, RotateCcw, Link2, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Role } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SimplifiedTaskDialogProps {
  roles: Role[]
  defaultQuadrant?: string
  initialDueDate?: Date
  onTaskAdded?: () => void
  trigger?: React.ReactNode
}

export default function SimplifiedTaskDialog({
  roles,
  defaultQuadrant = "q2",
  initialDueDate,
  onTaskAdded,
  trigger,
}: SimplifiedTaskDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [quadrant, setQuadrant] = useState(defaultQuadrant)
  const [roleId, setRoleId] = useState<string>("")
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDueDate)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<string>("")
  const [isBigRock, setIsBigRock] = useState(false)
  const [isRitual, setIsRitual] = useState(false)
  const [frequency, setFrequency] = useState<string>("one-time")
  const [status, setStatus] = useState<string>("to-do")
  const [links, setLinks] = useState<string>("")
  const [pomodoroRequired, setPomodoroRequired] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("basic")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const taskId = uuidv4()

      const { error } = await supabase.from("tasks").insert({
        id: taskId,
        title,
        description: description || null,
        quadrant,
        role_id: roleId || null,
        completed: status === "done",
        time_spent: 0,
        user_id: user.id,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
        is_big_rock: isBigRock,
        is_ritual: isRitual,
        priority: priority || null,
        frequency: frequency || "one-time",
        status: status || "to-do",
        links: links || null,
        pomodoro_required: pomodoroRequired,
      })

      if (error) {
        console.error("Error adding task:", error)
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Task added successfully!",
      })

      // Reset form
      resetForm()

      // Close dialog
      setOpen(false)

      // Callback
      if (onTaskAdded) onTaskAdded()
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getQuadrantInfo = (q: string) => {
    switch (q) {
      case "q1":
        return {
          label: "Q1: Urgent & Important",
          icon: <Clock className="h-4 w-4 text-red-500" />,
          description: "Critical tasks that need immediate attention",
        }
      case "q2":
        return {
          label: "Q2: Important, Not Urgent",
          icon: <Compass className="h-4 w-4 text-blue-500" />,
          description: "Strategic tasks that contribute to long-term goals",
        }
      case "q3":
        return {
          label: "Q3: Urgent, Not Important",
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          description: "Tasks that feel urgent but don't contribute to your goals",
        }
      case "q4":
        return {
          label: "Q4: Not Important or Urgent",
          icon: <ListTodo className="h-4 w-4 text-gray-500" />,
          description: "Low-value activities that can be eliminated",
        }
      default:
        return {
          label: "Q2: Important, Not Urgent",
          icon: <Compass className="h-4 w-4 text-blue-500" />,
          description: "Strategic tasks that contribute to long-term goals",
        }
    }
  }

  const quadrantInfo = getQuadrantInfo(quadrant)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setQuadrant(defaultQuadrant)
    setRoleId("")
    setDueDate(undefined)
    setStartDate(undefined)
    setPriority("")
    setIsBigRock(false)
    setIsRitual(false)
    setFrequency("one-time")
    setStatus("to-do")
    setLinks("")
    setPomodoroRequired(false)
    setActiveTab("basic")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              autoFocus
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Quadrant</label>
                  <Select value={quadrant} onValueChange={setQuadrant}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {quadrantInfo.icon}
                          <span>{quadrantInfo.label}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          <span>Q1: Urgent & Important</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="q2">
                        <div className="flex items-center gap-2">
                          <Compass className="h-4 w-4 text-blue-500" />
                          <span>Q2: Important, Not Urgent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="q3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>Q3: Urgent, Not Important</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="q4">
                        <div className="flex items-center gap-2">
                          <ListTodo className="h-4 w-4 text-gray-500" />
                          <span>Q4: Not Important or Urgent</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{quadrantInfo.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Set priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="A1">A1 (Highest)</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="B3">B3</SelectItem>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                      <SelectItem value="C3">C3 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <Select value={roleId} onValueChange={setRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-do">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="big-rock"
                    checked={isBigRock}
                    onChange={(e) => setIsBigRock(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="big-rock" className="text-sm font-medium flex items-center gap-1">
                    <Target className="h-4 w-4 text-primary" />
                    Mark as a Big Rock (high-priority Q2 goal)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pomodoro"
                    checked={pomodoroRequired}
                    onChange={(e) => setPomodoroRequired(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="pomodoro" className="text-sm font-medium flex items-center gap-1">
                    <Timer className="h-4 w-4 text-red-500" />
                    Pomodoro Required
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 border-b flex justify-between items-center">
                        <span className="text-sm font-medium">Select start date</span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStartDate(new Date())
                              setStartDatePickerOpen(false)
                            }}
                            className="h-7 px-2"
                          >
                            Today
                          </Button>
                          {startDate && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setStartDate(undefined)
                                setStartDatePickerOpen(false)
                              }}
                              className="h-7 px-2"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date)
                          setStartDatePickerOpen(false)
                        }}
                        initialFocus
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date</label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 border-b flex justify-between items-center">
                        <span className="text-sm font-medium">Select due date</span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDueDate(new Date())
                              setDatePickerOpen(false)
                            }}
                            className="h-7 px-2"
                          >
                            Today
                          </Button>
                          {dueDate && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDueDate(undefined)
                                setDatePickerOpen(false)
                              }}
                              className="h-7 px-2"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date)
                          setDatePickerOpen(false)
                        }}
                        initialFocus
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Frequency</label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ritual"
                  checked={isRitual}
                  onChange={(e) => setIsRitual(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="ritual" className="text-sm font-medium flex items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                  Mark as a Ritual (recurring habit)
                </label>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Add details about this task"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  Links / References
                </label>
                <Textarea
                  placeholder="Add links to relevant resources (Notion, Google Docs, etc.)"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">Add one link per line or separate with commas</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

