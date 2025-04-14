"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import RoleManagement from "@/components/role-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Role, Task } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export default function RolesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch roles and tasks
  const fetchData = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      console.log("Fetching roles and tasks for user:", user.id)

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (rolesError) {
        console.error("Error fetching roles:", rolesError)
        throw rolesError
      }

      // Fetch tasks (to check which roles are in use)
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, role_id")
        .eq("user_id", user.id)

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError)
        throw tasksError
      }

      // Transform data
      const transformedRoles: Role[] = rolesData.map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
        description: role.description || "",
        userId: role.user_id,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
      }))

      const transformedTasks: Task[] = tasksData.map((task) => ({
        id: task.id,
        title: "", // We only need id and roleId for this page
        quadrant: "",
        completed: false,
        timeSpent: 0,
        subtasks: [],
        roleId: task.role_id || "",
        userId: user.id,
      }))

      setRoles(transformedRoles)
      setTasks(transformedTasks)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Failed to load roles",
        description: "There was an error loading your roles. Please try again.",
        variant: "destructive",
      })

      // Set empty arrays as fallback
      setRoles([])
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new role
  const addRole = async (newRole: Omit<Role, "id">) => {
    if (!user) {
      toast({
        title: "Cannot add role",
        description: "You must be logged in to add a role.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Adding new role:", newRole)

      // Generate a UUID for the role
      const roleId = uuidv4()

      // Prepare the role data for Supabase with explicit ID
      const roleData = {
        id: roleId,
        name: newRole.name,
        color: newRole.color,
        description: newRole.description || "",
        user_id: user.id,
      }

      console.log("Sending role data to Supabase:", roleData)

      // Insert the role into Supabase
      const { data, error } = await supabase.from("roles").insert(roleData).select()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from insert operation")
      }

      console.log("Role added successfully:", data[0])

      // Add the new role to the state
      const newRoleWithId: Role = {
        id: data[0].id,
        name: data[0].name,
        color: data[0].color,
        description: data[0].description || "",
        userId: data[0].user_id,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at,
      }

      setRoles([newRoleWithId, ...roles])

      toast({
        title: "Role added",
        description: `"${newRole.name}" has been added to your roles.`,
      })
    } catch (error) {
      console.error("Error adding role:", error)
      toast({
        title: "Failed to add role",
        description: "There was an error adding the role. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete a role
  const deleteRole = async (roleId: string) => {
    if (!user) {
      toast({
        title: "Cannot delete role",
        description: "You must be logged in to delete a role.",
        variant: "destructive",
      })
      return
    }

    // Check if the role is in use
    const roleInUse = tasks.some((task) => task.roleId === roleId)
    if (roleInUse) {
      toast({
        title: "Cannot delete role",
        description: "This role is assigned to one or more tasks. Remove the role from all tasks first.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("roles").delete().eq("id", roleId).eq("user_id", user.id)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Remove the role from the state
      setRoles(roles.filter((role) => role.id !== roleId))

      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Failed to delete role",
        description: "There was an error deleting the role. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleManagement roles={roles} tasks={tasks} addRole={addRole} deleteRole={deleteRole} />
        </CardContent>
      </Card>
    </div>
  )
}

