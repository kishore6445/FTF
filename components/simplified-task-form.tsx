"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { CalendarIcon, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Role, Subtask, Task } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add priority field to the form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  quadrant: z.enum(["q1", "q2", "q3", "q4"]),
  roleId: z.string().optional(),
  dueDate: z.date().optional(),
  isImportant: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  isBigRock: z.boolean().default(false),
  priority: z.string().optional(), // Add priority field
})

type FormValues = z.infer<typeof formSchema>

interface SimplifiedTaskFormProps {
  roles: Role[]
  onSuccess?: () => void
  onCancel?: () => void
  addTask?: (task: Partial<Task>) => Promise<void>
}

export default function SimplifiedTaskForm({ roles, onSuccess, onCancel, addTask }: SimplifiedTaskFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState("")
  const [quadrantHelp, setQuadrantHelp] = useState(false)

  useEffect(() => {
    console.log("Roles available:", roles)
  }, [roles])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Add priority to defaultValues
    defaultValues: {
      title: "",
      description: "",
      quadrant: "q2",
      roleId: "",
      isImportant: false,
      isUrgent: false,
      isBigRock: false,
      priority: "", // Add default value for priority
    },
  })

  // Watch for changes to important/urgent to set quadrant
  const isImportant = form.watch("isImportant")
  const isUrgent = form.watch("isUrgent")

  // Update quadrant when important/urgent change
  useState(() => {
    let quadrant = "q4" // Default: Not Important, Not Urgent

    if (isImportant && isUrgent) {
      quadrant = "q1" // Important & Urgent
    } else if (isImportant && !isUrgent) {
      quadrant = "q2" // Important & Not Urgent
    } else if (!isImportant && isUrgent) {
      quadrant = "q3" // Not Important & Urgent
    }

    form.setValue("quadrant", quadrant as "q1" | "q2" | "q3" | "q4")
  }, [isImportant, isUrgent, form])

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()])
      setNewSubtask("")
    }
  }

  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks]
    updatedSubtasks.splice(index, 1)
    setSubtasks(updatedSubtasks)
  }

  const handleSubmit = async (values: FormValues) => {
    if (!user) return

    try {
      const taskId = uuidv4()

      // Create subtasks array
      const taskSubtasks: Subtask[] = subtasks.map((title) => ({
        id: uuidv4(),
        taskId,
        title,
        completed: false,
        userId: user.id,
      }))

      // Include priority in the newTask object for local state
      const newTask = {
        id: taskId,
        title: values.title,
        description: values.description || "",
        quadrant: values.quadrant,
        roleId: values.roleId || undefined,
        completed: false,
        timeSpent: 0,
        subtasks: taskSubtasks,
        userId: user.id,
        dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
        is_big_rock: values.isBigRock,
        priority: values.priority, // Keep priority in local state
      }

      if (addTask) {
        // Use the provided addTask function if available
        await addTask(newTask)
      } else {
        // Otherwise, directly add to the database
        // Remove priority from database insert as it doesn't exist in the schema
        const { error } = await supabase.from("tasks").insert({
          id: taskId,
          title: values.title,
          description: values.description || "",
          quadrant: values.quadrant,
          role_id: values.roleId || null,
          completed: false,
          time_spent: 0,
          user_id: user.id,
          due_date: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : null,
          // Removed priority field as it doesn't exist in the database schema
          // Removed is_big_rock field as it doesn't exist in the database schema
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

        // Add subtasks if any
        if (taskSubtasks.length > 0) {
          const subtasksForDb = taskSubtasks.map((subtask) => ({
            id: subtask.id,
            task_id: subtask.taskId,
            title: subtask.title,
            completed: subtask.completed,
            user_id: subtask.userId,
          }))

          const { error: subtaskError } = await supabase.from("subtasks").insert(subtasksForDb)

          if (subtaskError) {
            console.error("Error adding subtasks:", subtaskError)
            toast({
              title: "Warning",
              description: "Task added but subtasks could not be saved.",
              variant: "destructive",
            })
          }
        }

        toast({
          title: "Success",
          description: "Task added successfully!",
        })
      }

      form.reset()
      setSubtasks([])
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Task Name - Core Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Name</FormLabel>
                <FormControl>
                  <Input placeholder="What needs to be done?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Big Rock & Role - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isBigRock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Target className="h-4 w-4 mr-1 text-primary" />
                    Big Rock
                  </FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                </FormItem>
              )}
            />
          </div>

          {/* Quadrant Selector - Buttons */}
          <FormField
            control={form.control}
            name="quadrant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quadrant</FormLabel>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant={field.value === "q1" ? "default" : "outline"}
                    className={field.value === "q1" ? "bg-red-500 hover:bg-red-600" : ""}
                    onClick={() => field.onChange("q1")}
                  >
                    Q1
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "q2" ? "default" : "outline"}
                    className={field.value === "q2" ? "bg-blue-500 hover:bg-blue-600" : ""}
                    onClick={() => field.onChange("q2")}
                  >
                    Q2
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "q3" ? "default" : "outline"}
                    className={field.value === "q3" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                    onClick={() => field.onChange("q3")}
                  >
                    Q3
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "q4" ? "default" : "outline"}
                    className={field.value === "q4" ? "bg-gray-500 hover:bg-gray-600" : ""}
                    onClick={() => field.onChange("q4")}
                  >
                    Q4
                  </Button>
                </div>
                <FormDescription className="text-xs mt-1">
                  Q1: Important & Urgent | Q2: Important & Not Urgent | Q3: Not Important & Urgent | Q4: Not Important &
                  Not Urgent
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Date and Repeat - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Today</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Simple Repeat Toggle */}
            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <FormLabel>Repeat Daily?</FormLabel>
                <Switch />
              </div>
            </div>
          </div>

          {/* Advanced Settings (Collapsible) */}
          <div className="pt-2">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <span>Advanced Settings</span>
                <span className="shrink-0 transition duration-300 group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>

              <div className="mt-4 space-y-4 px-1">
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add details about this task" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        <option value="">Select priority</option>
                        <option value="A1">A1 (Highest)</option>
                        <option value="A2">A2</option>
                        <option value="A3">A3</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="B3">B3</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                        <option value="C3">C3</option>
                      </select>
                      <FormDescription className="text-xs">A1 is highest priority, C3 is lowest</FormDescription>
                    </FormItem>
                  )}
                />

                {/* Subtasks */}
                <div className="space-y-2">
                  <FormLabel>Subtasks</FormLabel>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a subtask"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSubtask()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSubtask} size="sm">
                      Add
                    </Button>
                  </div>

                  {subtasks.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                          <span className="text-sm">{subtask}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSubtask(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button type="submit">Add Task</Button>
              <Button
                type="submit"
                variant="secondary"
                onClick={() => {
                  // Logic to add and create another
                  form.handleSubmit(handleSubmit)()
                  // Don't close the dialog
                  // Reset only some fields
                  form.setValue("title", "")
                  form.setValue("description", "")
                  setSubtasks([])
                }}
              >
                Add + Another
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

