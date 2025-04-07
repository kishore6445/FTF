"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AddRitualDialogNew from "./add-ritual-dialog-new"
import { TasksProvider } from "@/contexts/tasks-context"

export default function RitualDialogWrapper() {
  const [open, setOpen] = useState(false)

  return (
    <TasksProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)} className="bg-black hover:bg-black/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Ritual
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <AddRitualDialogNew onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </TasksProvider>
  )
}

