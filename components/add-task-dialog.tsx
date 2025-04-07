"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AddTaskForm from "@/components/add-task-form"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Role } from "@/lib/types"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultQuadrant?: string
  initialDueDate?: Date
  onTaskAdded?: () => void
}

export default function AddTaskDialog({
  open,
  onOpenChange,
  defaultQuadrant,
  initialDueDate,
  onTaskAdded,
}: AddTaskDialogProps) {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("roles")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true })

        if (error) throw error
        setRoles(data || [])
      } catch (error) {
        console.error("Error fetching roles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchRoles()
    }
  }, [user, open])

  const handleSuccess = () => {
    onOpenChange(false)
    if (onTaskAdded) onTaskAdded()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <p className="text-sm text-muted-foreground">Focus on what matters most.</p>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AddTaskForm
            roles={roles}
            defaultQuadrant={defaultQuadrant}
            initialDueDate={initialDueDate}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

