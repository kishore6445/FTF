// "use client"

// import { useState } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import * as z from "zod"
// import { v4 as uuidv4 } from "uuid"
// import { format } from "date-fns"
// import { CalendarIcon } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Switch } from "@/components/ui/switch"
// import { useAuth } from "@/contexts/auth-context"
// import { useTasks } from "@/contexts/tasks-context"
// import type { Role, Subtask } from "@/lib/types"
// import SubtaskManager from "@/components/subtask-manager"
// import RecurrenceForm from "@/components/recurrence-form"

// const formSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   description: z.string().optional(),
//   quadrant: z.enum(["q1", "q2", "q3", "q4"]),
//   roleId: z.string().optional(),
//   dueDate: z.date().optional(),
//   isRitual: z.boolean().default(false),
//   isBigRock: z.boolean().default(false),
// })

// type FormValues = z.infer<typeof formSchema>

// interface AddTaskFormProps {
//   roles: Role[]
//   defaultQuadrant?: string
//   initialDueDate?: Date
//   onSuccess?: () => void
//   onCancel?: () => void
// }

// export default function AddTaskForm({
//   roles,
//   defaultQuadrant = "q2",
//   initialDueDate,
//   onSuccess,
//   onCancel,
// }: AddTaskFormProps) {
//   const { user } = useAuth()
//   const { addTask } = useTasks()
//   const [activeTab, setActiveTab] = useState("basic")
//   const [subtasks, setSubtasks] = useState<Subtask[]>([])
//   const [recurrencePattern, setRecurrencePattern] = useState<any>(null)

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       quadrant: defaultQuadrant as "q1" | "q2" | "q3" | "q4",
//       roleId: "",
//       dueDate: initialDueDate,
//       isRitual: false,
//       isBigRock: false,
//     },
//   })

//   const handleSubmit = async (values: FormValues) => {
//     if (!user) return

//     try {
//       const taskId = uuidv4()

//       await addTask({
//         id: taskId,
//         title: values.title,
//         description: values.description || "",
//         quadrant: values.quadrant,
//         roleId: values.roleId || undefined,
//         completed: false,
//         timeSpent: 0,
//         subtasks: subtasks.map((subtask) => ({
//           ...subtask,
//           taskId: taskId,
//           userId: user.id,
//         })),
//         userId: user.id,
//         dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
//         recurrencePattern: recurrencePattern,
//         isRitual: values.isRitual,
//         is_big_rock: values.isBigRock,
//       })

//       form.reset()
//       setSubtasks([])
//       setRecurrencePattern(null)
//       if (onSuccess) onSuccess()
//     } catch (error) {
//       console.error("Error adding task:", error)
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid grid-cols-3 mb-4">
//             <TabsTrigger value="basic">Basic Info</TabsTrigger>
//             <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
//             <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
//           </TabsList>

//           <TabsContent value="basic" className="space-y-4">
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Title</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Task title" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea placeholder="Task description (optional)" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="quadrant"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Quadrant</FormLabel>
//                     <RadioGroup
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       className="grid grid-cols-2 gap-2"
//                     >
//                       <FormItem className="flex items-center space-x-2 space-y-0">
//                         <FormControl>
//                           <RadioGroupItem value="q1" />
//                         </FormControl>
//                         <FormLabel className="font-normal text-sm">Q1: Urgent & Important</FormLabel>
//                       </FormItem>
//                       <FormItem className="flex items-center space-x-2 space-y-0">
//                         <FormControl>
//                           <RadioGroupItem value="q2" />
//                         </FormControl>
//                         <FormLabel className="font-normal text-sm">Q2: Not Urgent & Important</FormLabel>
//                       </FormItem>
//                       <FormItem className="flex items-center space-x-2 space-y-0">
//                         <FormControl>
//                           <RadioGroupItem value="q3" />
//                         </FormControl>
//                         <FormLabel className="font-normal text-sm">Q3: Urgent & Not Important</FormLabel>
//                       </FormItem>
//                       <FormItem className="flex items-center space-x-2 space-y-0">
//                         <FormControl>
//                           <RadioGroupItem value="q4" />
//                         </FormControl>
//                         <FormLabel className="font-normal text-sm">Q4: Not Urgent & Not Important</FormLabel>
//                       </FormItem>
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             </div>

//             <div className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="roleId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Role</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <SelectTrigger id="role">
//                         <SelectValue placeholder="Select a role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="no-role">No Role</SelectItem>
//                         {roles.map((role) => (
//                           <SelectItem key={role.id} value={role.id}>
//                             {role.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="dueDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Due Date</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full justify-start text-left font-normal",
//                               !field.value && "text-muted-foreground",
//                             )}
//                           >
//                             <CalendarIcon className="mr-2 h-4 w-4" />
//                             {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <FormField
//               control={form.control}
//               name="isRitual"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
//                   <div className="space-y-0.5">
//                     <FormLabel>Daily Ritual</FormLabel>
//                     <FormDescription>Track this task as a daily habit</FormDescription>
//                   </div>
//                   <FormControl>
//                     <Switch checked={field.value} onCheckedChange={field.onChange} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="isBigRock"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
//                   <div className="space-y-0.5">
//                     <FormLabel>Big Rock</FormLabel>
//                     <FormDescription>Mark as a high-priority "big rock" task</FormDescription>
//                   </div>
//                   <FormControl>
//                     <Switch checked={field.value} onCheckedChange={field.onChange} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//           </div>
//         </TabsContent>

//         <TabsContent value="subtasks" className="space-y-4">
//           <div className="space-y-4">
//             <div>
//               <h3 className="text-sm font-medium mb-2">Subtasks</h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 Break down your task into smaller, manageable steps
//               </p>
//             </div>

//             <SubtaskManager subtasks={subtasks} onChange={setSubtasks} />
//           </div>
//         </TabsContent>

//         <TabsContent value="recurrence" className="space-y-4">
//           <RecurrenceForm onRecurrenceChange={setRecurrencePattern} />
//         </TabsContent>
//       </Tabs>

//       <div className="flex justify-end gap-2">
//         {onCancel && (
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//         )}
//         <Button type="submit">Add Task</Button>
//       </div>
//     </form>
//   </Form>
//  )
// }

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useTasks } from "@/contexts/tasks-context"
import type { Role, Subtask } from "@/lib/types"
import SubtaskManager from "@/components/subtask-manager"
import RecurrenceForm from "@/components/recurrence-form"

// Define RecurrencePattern type instead of using 'any'
interface RecurrencePattern {
  type: string;
  interval?: number;
  frequency?: string;
  endDate?: Date;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  quadrant: z.enum(["q1", "q2", "q3", "q4"]),
  roleId: z.string().optional(),
  dueDate: z.date().optional(),
  isRitual: z.boolean().default(false),
  isBigRock: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface AddTaskFormProps {
  roles: Role[]
  defaultQuadrant?: string
  initialDueDate?: Date
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddTaskForm({
  roles,
  defaultQuadrant = "q2",
  initialDueDate,
  onSuccess,
  onCancel,
}: AddTaskFormProps) {
  const { user } = useAuth()
  const { addTask } = useTasks()
  const [activeTab, setActiveTab] = useState("basic")
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      quadrant: defaultQuadrant as "q1" | "q2" | "q3" | "q4",
      roleId: "",
      dueDate: initialDueDate,
      isRitual: false,
      isBigRock: false,
    },
  })

  const handleSubmit = async (values: FormValues) => {
    if (!user) return

    try {
      const taskId = uuidv4()

      await addTask({
        id: taskId,
        title: values.title,
        description: values.description || "",
        quadrant: values.quadrant,
        roleId: values.roleId || undefined,
        completed: false,
        timeSpent: 0,
        subtasks: subtasks.map((subtask) => ({
          ...subtask,
          taskId: taskId,
          userId: user.id,
        })),
        userId: user.id,
        dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
        recurrencePattern: recurrencePattern,
        isRitual: values.isRitual,
        isBigRock: values.isBigRock, // Changed from is_big_rock to maintain consistency
      })

      form.reset()
      setSubtasks([])
      setRecurrencePattern(null)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quadrant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quadrant</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-2"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="q1" />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Q1: Urgent & Important</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="q2" />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Q2: Not Urgent & Important</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="q3" />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Q3: Urgent & Not Important</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="q4" />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Q4: Not Urgent & Not Important</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-role">No Role</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isRitual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Daily Ritual</FormLabel>
                      <FormDescription>Track this task as a daily habit</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isBigRock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Big Rock</FormLabel>
                      <FormDescription>Mark as a high-priority "big rock" task</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="subtasks" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Subtasks</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Break down your task into smaller, manageable steps
                </p>
              </div>
              <SubtaskManager subtasks={subtasks} onChange={setSubtasks} />
            </div>
          </TabsContent>

          <TabsContent value="recurrence" className="space-y-4">
            <RecurrenceForm onRecurrenceChange={setRecurrencePattern} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Add Task</Button>
        </div>
      </form>
    </Form>
  )
}