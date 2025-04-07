"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Role, Task } from "@/lib/types"

interface RoleManagementProps {
  roles: Role[]
  tasks: Task[]
  addRole: (role: Omit<Role, "id">) => void
  deleteRole: (roleId: string) => void
}

export default function RoleManagement({ roles, tasks, addRole, deleteRole }: RoleManagementProps) {
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [newRole, setNewRole] = useState<Omit<Role, "id">>({
    name: "",
    color: "#3b82f6", // Default blue color
    description: "",
    userId: "",
  })
  const [error, setError] = useState<string | null>(null)

  const handleAddRole = () => {
    if (!newRole.name.trim()) {
      setError("Role name is required")
      return
    }

    try {
      addRole({
        name: newRole.name,
        color: newRole.color,
        description: newRole.description,
        userId: "", // This will be set in the addRole function
      })

      setNewRole({
        name: "",
        color: "#3b82f6",
        description: "",
        userId: "",
      })

      setIsAddRoleOpen(false)
      setError(null)
    } catch (err) {
      console.error("Error in handleAddRole:", err)
      setError("Failed to add role. Please try again.")
    }
  }

  const handleDeleteRole = (roleId: string) => {
    // Check if any tasks are using this role
    const tasksUsingRole = tasks.some((task) => task.roleId === roleId)
    if (tasksUsingRole) {
      setError("Cannot delete a role that is assigned to tasks")
      return
    }

    try {
      deleteRole(roleId)
      setError(null)
    } catch (err) {
      console.error("Error in handleDeleteRole:", err)
      setError("Failed to delete role. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Your Roles</h3>
        <Button onClick={() => setIsAddRoleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>You haven't created any roles yet.</p>
              <p className="text-sm mt-1">Roles help you categorize tasks based on different areas of your life.</p>
            </CardContent>
          </Card>
        ) : (
          roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onDelete={() => handleDeleteRole(role.id)}
              taskCount={tasks.filter((task) => task.roleId === role.id).length}
            />
          ))
        )}
      </div>

      <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="e.g., Parent, Professional, Student"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={newRole.color}
                  onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <div className="w-full h-10 rounded-md" style={{ backgroundColor: newRole.color }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Describe this role and its responsibilities"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole}>Add Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface RoleCardProps {
  role: Role
  onDelete: () => void
  taskCount: number
}

function RoleCard({ role, onDelete, taskCount }: RoleCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: role.color }} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{role.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            disabled={taskCount > 0}
            title={taskCount > 0 ? "Cannot delete a role with assigned tasks" : "Delete role"}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {role.description && <p className="text-sm text-muted-foreground mb-2">{role.description}</p>}
        <div className="text-xs text-muted-foreground">
          {taskCount} {taskCount === 1 ? "task" : "tasks"} assigned
        </div>
      </CardContent>
    </Card>
  )
}

