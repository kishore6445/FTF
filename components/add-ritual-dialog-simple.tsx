"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddRitualDialogSimpleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function AddRitualDialogSimple({ open, onOpenChange, onClose }: AddRitualDialogSimpleProps) {
  const [name, setName] = React.useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (name.trim()) {
      // Handle the submission logic here
      console.log("Adding ritual:", name)
      setName("")
      onOpenChange(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Ritual</DialogTitle>
          <DialogDescription>Create a new daily ritual to track.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Morning Meditation"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Ritual</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddRitualDialogSimple

