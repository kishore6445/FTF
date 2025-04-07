"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { Loader2, Plus, Edit, Trash2, User, Calendar, CheckCircle2, Circle } from "lucide-react"
import type { Role } from "@/lib/types"

type RoleGoal = {
  id: string
  role_id: string
  title: string
  description: string
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export default function RolePlanning() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [roleGoals, setRoleGoals] = useState<RoleGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("roles")

  // Role state
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleColor, setNewRoleColor] = useState("#3b82f6")
  const [newRoleDescription, setNewRoleDescription] = useState("")

  // Goal state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)
  const [currentGoal, setCurrentGoal] = useState<RoleGoal | null>(null)
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalDescription, setNewGoalDescription] = useState("")
  const [newGoalRoleId, setNewGoalRoleId] = useState("")

  // Task state
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [newTaskQuadrant, setNewTaskQuadrant] = useState("q2")
  const [newTaskRoleId, setNewTaskRoleId] = useState("")

  // Fetch roles and goals
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from("roles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (rolesError) throw rolesError

        // Transform roles data
        const transformedRoles: Role[] = (rolesData || []).map((role) => ({
          id: role.id,
          name: role.name,
          color: role.color || "#3b82f6",
          description: role.description || "",
          userId: role.user_id,
          createdAt: role.created_at,
          updatedAt: role.updated_at,
        }))

        setRoles(transformedRoles)

        // Check if role_goals table exists
        const { error: tableCheckError } = await supabase.from("role_goals").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          // Table doesn't exist, create it
          await createRoleGoalsTable()
        }

        // Fetch role goals
        const { data: goalsData, error: goalsError } = await supabase
          .from("role_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (goalsError && !goalsError.message.includes("does not exist")) throw goalsError

        setRoleGoals(goalsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: typeof error === "object" ? "Failed to load roles and goals" : String(error),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  // Create the role_goals table if it doesn't exist
  const createRoleGoalsTable = async () => {
    try {
      // Skip the RPC call and go directly to the alternative approach
      await createRoleGoalsTableAlternative()
    } catch (error) {
      console.error("Exception in createRoleGoalsTable:", error)
      toast({
        title: "Error",
        description: "Failed to create role_goals table. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Alternative approach to create the table using multiple queries
  const createRoleGoalsTableAlternative = async () => {
    try {
      // This is a simplified approach - in production, you'd want to use migrations
      const queries = [
        `CREATE TABLE IF NOT EXISTS role_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT FALSE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        `ALTER TABLE role_goals ENABLE ROW LEVEL SECURITY`,
        `CREATE POLICY "Users can view their own role goals" ON role_goals FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY "Users can insert their own role goals" ON role_goals FOR INSERT WITH CHECK (auth.uid() = user_id)`,
        `CREATE POLICY "Users can update their own role goals" ON role_goals FOR UPDATE USING (auth.uid() = user_id)`,
        `CREATE POLICY "Users can delete their own role goals" ON role_goals FOR DELETE USING (auth.uid() = user_id)`,
      ]

      // Execute each query
      for (const query of queries) {
        const { error } = await supabase.rpc("run_sql", { sql: query })
        if (error && !error.message.includes("already exists")) {
          console.error(`Error executing query: ${query}`, error)
        }
      }
    } catch (error) {
      console.error("Exception in createRoleGoalsTableAlternative:", error)
    }
  }

  // Add a new role
  const addRole = async () => {
    if (!user) return
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a role name",
        variant: "destructive",
      })
      return
    }

    try {
      const roleId = uuidv4()
      const newRole = {
        id: roleId,
        name: newRoleName.trim(),
        color: newRoleColor,
        description: newRoleDescription.trim(),
        user_id: user.id,
      }

      const { error } = await supabase.from("roles").insert(newRole)

      if (error) throw error

      // Add to local state
      setRoles([
        {
          ...newRole,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...roles,
      ])

      // Reset form
      setNewRoleName("")
      setNewRoleColor("#3b82f6")
      setNewRoleDescription("")
      setIsAddRoleOpen(false)

      toast({
        title: "Success",
        description: "Role added successfully",
      })
    } catch (error) {
      console.error("Error adding role:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to add role",
        variant: "destructive",
      })
    }
  }

  // Update a role
  const updateRole = async () => {
    if (!user || !currentRole) return

    try {
      const updatedRole = {
        name: newRoleName.trim(),
        color: newRoleColor,
        description: newRoleDescription.trim(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("roles").update(updatedRole).eq("id", currentRole.id).eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setRoles(
        roles.map((role) =>
          role.id === currentRole.id
            ? {
                ...role,
                name: updatedRole.name,
                color: updatedRole.color,
                description: updatedRole.description,
                updatedAt: updatedRole.updated_at,
              }
            : role,
        ),
      )

      // Reset form
      setIsEditRoleOpen(false)
      setCurrentRole(null)

      toast({
        title: "Success",
        description: "Role updated successfully",
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to update role",
        variant: "destructive",
      })
    }
  }

  // Delete a role
  const deleteRole = async (roleId: string) => {
    if (!user) return

    // Check if role has goals
    const hasGoals = roleGoals.some((goal) => goal.role_id === roleId)
    if (hasGoals) {
      toast({
        title: "Cannot delete",
        description: "This role has goals assigned to it. Delete the goals first.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to delete this role?")) {
      return
    }

    try {
      const { error } = await supabase.from("roles").delete().eq("id", roleId).eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setRoles(roles.filter((role) => role.id !== roleId))

      toast({
        title: "Success",
        description: "Role deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  // Add a new goal
  const addGoal = async () => {
    if (!user) return
    if (!newGoalTitle.trim() || !newGoalRoleId) {
      toast({
        title: "Error",
        description: "Please enter a goal title and select a role",
        variant: "destructive",
      })
      return
    }

    try {
      const goalId = uuidv4()
      const newGoal = {
        id: goalId,
        role_id: newGoalRoleId,
        title: newGoalTitle.trim(),
        description: newGoalDescription.trim(),
        completed: false,
        user_id: user.id,
      }

      const { error } = await supabase.from("role_goals").insert(newGoal)

      if (error) throw error

      // Add to local state
      setRoleGoals([
        {
          ...newGoal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...roleGoals,
      ])

      // Reset form
      setNewGoalTitle("")
      setNewGoalDescription("")
      setNewGoalRoleId("")
      setIsAddGoalOpen(false)

      toast({
        title: "Success",
        description: "Goal added successfully",
      })
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to add goal",
        variant: "destructive",
      })
    }
  }

  // Update a goal
  const updateGoal = async () => {
    if (!user || !currentGoal) return

    try {
      const updatedGoal = {
        role_id: newGoalRoleId,
        title: newGoalTitle.trim(),
        description: newGoalDescription.trim(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("role_goals")
        .update(updatedGoal)
        .eq("id", currentGoal.id)
        .eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setRoleGoals(roleGoals.map((goal) => (goal.id === currentGoal.id ? { ...goal, ...updatedGoal } : goal)))

      // Reset form
      setIsEditGoalOpen(false)
      setCurrentGoal(null)

      toast({
        title: "Success",
        description: "Goal updated successfully",
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to update goal",
        variant: "destructive",
      })
    }
  }

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    if (!user) return

    if (!confirm("Are you sure you want to delete this goal?")) {
      return
    }

    try {
      const { error } = await supabase.from("role_goals").delete().eq("id", goalId).eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setRoleGoals(roleGoals.filter((goal) => goal.id !== goalId))

      toast({
        title: "Success",
        description: "Goal deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to delete goal",
        variant: "destructive",
      })
    }
  }

  // Toggle goal completion
  const toggleGoalCompletion = async (goalId: string) => {
    if (!user) return

    const goal = roleGoals.find((g) => g.id === goalId)
    if (!goal) return

    try {
      const { error } = await supabase
        .from("role_goals")
        .update({
          completed: !goal.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId)
        .eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setRoleGoals(
        roleGoals.map((g) =>
          g.id === goalId ? { ...g, completed: !g.completed, updated_at: new Date().toISOString() } : g,
        ),
      )

      toast({
        title: "Success",
        description: goal.completed ? "Goal marked as incomplete" : "Goal marked as complete",
      })
    } catch (error) {
      console.error("Error toggling goal completion:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to update goal",
        variant: "destructive",
      })
    }
  }

  // Open edit role dialog
  const openEditRoleDialog = (role: Role) => {
    setCurrentRole(role)
    setNewRoleName(role.name)
    setNewRoleColor(role.color)
    setNewRoleDescription(role.description || "")
    setIsEditRoleOpen(true)
  }

  // Open edit goal dialog
  const openEditGoalDialog = (goal: RoleGoal) => {
    setCurrentGoal(goal)
    setNewGoalTitle(goal.title)
    setNewGoalDescription(goal.description || "")
    setNewGoalRoleId(goal.role_id)
    setIsEditGoalOpen(true)
  }

  // Add a new task
  const handleAddTask = async () => {
    if (!user) return
    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    try {
      const taskId = uuidv4()
      const newTask = {
        id: taskId,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        quadrant: newTaskQuadrant,
        role_id: newTaskRoleId || null,
        completed: false,
        time_spent: 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: newTaskDueDate,
        recurrence_id: null,
        is_ritual: false,
      }

      const { error } = await supabase.from("tasks").insert(newTask)

      if (error) throw error

      // Reset form
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskDueDate(format(new Date(), "yyyy-MM-dd"))
      setNewTaskQuadrant("q2")
      setNewTaskRoleId("")
      setIsAddTaskDialogOpen(false)

      toast({
        title: "Success",
        description: "Task added successfully",
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to add task",
        variant: "destructive",
      })
    }
  }

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : "Unknown Role"
  }

  // Get role color by ID
  const getRoleColor = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.color : "#3b82f6"
  }

  // Get goals for a role
  const getGoalsForRole = (roleId: string) => {
    return roleGoals.filter((goal) => goal.role_id === roleId)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Role Planning</h2>
          <p className="text-muted-foreground">Define your key roles and set goals for each one</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>
                  Define a new role in your life (e.g., Parent, Professional, Friend)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Parent, Professional, Friend"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleColor">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="roleColor"
                      type="color"
                      value={newRoleColor}
                      onChange={(e) => setNewRoleColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <div className="w-full h-10 rounded-md" style={{ backgroundColor: newRoleColor }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description (Optional)</Label>
                  <Textarea
                    id="roleDescription"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Describe this role and its responsibilities"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addRole}>Add Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>Set a goal for one of your roles</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="goalRole">Role</Label>
                  <select
                    id="goalRole"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newGoalRoleId}
                    onChange={(e) => setNewGoalRoleId(e.target.value)}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalTitle">Goal Title</Label>
                  <Input
                    id="goalTitle"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Enter your goal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalDescription">Description (Optional)</Label>
                  <Textarea
                    id="goalDescription"
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    placeholder="Describe this goal in more detail"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addGoal}>Add Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" onClick={() => setIsAddTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6 space-y-6">
          {roles.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Roles Defined Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Define your key roles to help balance your responsibilities and set focused goals.
                </p>
                <Button onClick={() => setIsAddRoleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Role
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: role.color }} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditRoleDialog(role)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRole(role.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {role.description && <CardDescription>{role.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Goals: {getGoalsForRole(role.id).length}</span>
                        <span>
                          Completed: {getGoalsForRole(role.id).filter((g) => g.completed).length} /{" "}
                          {getGoalsForRole(role.id).length}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setNewGoalRoleId(role.id)
                          setIsAddGoalOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal for this Role
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="mt-6 space-y-6">
          {roleGoals.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Goals Set Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Set goals for your roles to help you focus on what matters most.
                </p>
                <Button onClick={() => setIsAddGoalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {roleGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className="inline-block px-2 py-1 rounded-full text-xs mb-2"
                          style={{
                            backgroundColor: `${getRoleColor(goal.role_id)}20`,
                            color: getRoleColor(goal.role_id),
                          }}
                        >
                          {getRoleName(goal.role_id)}
                        </div>
                        <CardTitle className={`text-xl ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                          {goal.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleGoalCompletion(goal.id)}
                          title={goal.completed ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {goal.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditGoalDialog(goal)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {goal.description && (
                    <CardContent className="py-2">
                      <p className={goal.completed ? "text-muted-foreground" : ""}>{goal.description}</p>
                    </CardContent>
                  )}
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewTaskTitle(`Goal: ${goal.title}`)
                        setNewTaskDescription(goal.description || "")
                        setNewTaskRoleId(goal.role_id)
                        setIsAddTaskDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task from Goal
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the details of your role</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editRoleName">Role Name</Label>
              <Input
                id="editRoleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., Parent, Professional, Friend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRoleColor">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="editRoleColor"
                  type="color"
                  value={newRoleColor}
                  onChange={(e) => setNewRoleColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <div className="w-full h-10 rounded-md" style={{ backgroundColor: newRoleColor }} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRoleDescription">Description (Optional)</Label>
              <Textarea
                id="editRoleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Describe this role and its responsibilities"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update the details of your goal</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editGoalRole">Role</Label>
              <select
                id="editGoalRole"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newGoalRoleId}
                onChange={(e) => setNewGoalRoleId(e.target.value)}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGoalTitle">Goal Title</Label>
              <Input
                id="editGoalTitle"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Enter your goal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGoalDescription">Description (Optional)</Label>
              <Textarea
                id="editGoalDescription"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                placeholder="Describe this goal in more detail"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quadrant">Quadrant</Label>
              <select
                id="quadrant"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTaskQuadrant}
                onChange={(e) => setNewTaskQuadrant(e.target.value)}
              >
                <option value="q1">Q1: Important & Urgent</option>
                <option value="q2">Q2: Important & Not Urgent</option>
                <option value="q3">Q3: Not Important & Urgent</option>
                <option value="q4">Q4: Not Important & Not Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskRole">Role (Optional)</Label>
              <select
                id="taskRole"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTaskRoleId}
                onChange={(e) => setNewTaskRoleId(e.target.value)}
              >
                <option value="">No specific role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

