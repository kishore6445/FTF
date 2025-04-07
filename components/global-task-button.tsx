"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import SimplifiedTaskDialog from "@/components/simplified-task-dialog"
import { useRoles } from "@/contexts/roles-context"

// Named export
export function GlobalTaskButton() {
  const { roles } = useRoles()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <SimplifiedTaskDialog
        roles={roles || []}
        onTaskAdded={() => {
          // Force refresh the page to show the new task
          window.location.reload()
        }}
        trigger={
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  )
}

// Default export for backward compatibility
export default GlobalTaskButton

