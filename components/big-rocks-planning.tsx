"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, Plus, Save, Trash2, Calendar } from "lucide-react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { format, startOfWeek, endOfWeek } from "date-fns"
import type { Role } from "@/lib/types"

interface BigRock {
  id: string
  title: string
  description?: string
  quadrant: string
  role_id?: string
  due_date?: string
  order: number
  user_id: string
  created_at: string
  updated_at: string
}

interface BigRockItemProps {
  rock: BigRock
  index: number
  roles: Role[]
  moveRock: (dragIndex: number, hoverIndex: number) => void
  updateRock: (id: string, data: Partial<BigRock>) => void
  deleteRock: (id: string) => void
}

const ItemTypes = {
  ROCK: "rock",
}

function BigRockItem({ rock, index, roles, moveRock, updateRock, deleteRock }: BigRockItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROCK,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: ItemTypes.ROCK,
    hover: (item: { index: number }, monitor) => {
      if (item.index === index) {
        return
      }
      moveRock(item.index, index)
      item.index = index
    },
  })

  const role = roles.find((r) => r.id === rock.role_id)

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 mb-3 border rounded-md bg-white ${isDragging ? "opacity-50" : ""}`}
      style={{ cursor: "move" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Input
            value={rock.title}
            onChange={(e) => updateRock(rock.id, { title: e.target.value })}
            className="font-medium mb-2"
            placeholder="Big rock title"
          />

          <Textarea
            value={rock.description || ""}
            onChange={(e) => updateRock(rock.id, { description: e.target.value })}
            placeholder="Description (optional)"
            className="text-sm mb-3 min-h-[80px]"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Quadrant</Label>
              <Select value={rock.quadrant} onValueChange={(value) => updateRock(rock.id, { quadrant: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Q1: Urgent & Important</SelectItem>
                  <SelectItem value="q2">Q2: Important, Not Urgent</SelectItem>
                  <SelectItem value="q3">Q3: Urgent, Not Important</SelectItem>
                  <SelectItem value="q4">Q4: Not Important or Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs mb-1 block">Role</Label>
              <Select value={rock.role_id || ""} onValueChange={(value) => updateRock(rock.id, { role_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
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
          </div>

          <div className="mt-3">
            <Label className="text-xs mb-1 block">Due Date (Optional)</Label>
            <Input
              type="date"
              value={rock.due_date || ""}
              onChange={(e) => updateRock(rock.id, { due_date: e.target.value })}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteRock(rock.id)}
          className="text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default function BigRocksPlanning() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [rocks, setRocks] = useState<BigRock[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  // Get current week range
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })
  const weekRange = `${format(startOfCurrentWeek, "MMM d")} - ${format(endOfCurrentWeek, "MMM d, yyyy")}`

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase.from("roles").select("*").eq("user_id", user.id)

      if (rolesError) {
        console.error("Error fetching roles:", rolesError)
      } else {
        setRoles(rolesData || [])
      }

      // Check if big_rocks table exists
      const { data: tableExists, error: tableError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "big_rocks")
        .eq("table_schema", "public")

      if (tableError || !tableExists) {
        console.log("Big rocks table doesn't exist yet")
        setIsLoading(false)
        return
      }

      // Fetch big rocks
      const { data: rocksData, error: rocksError } = await supabase
        .from("big_rocks")
        .select("*")
        .eq("user_id", user.id)
        .order("order", { ascending: true })

      if (rocksError) {
        console.error("Error fetching big rocks:", rocksError)
        toast({
          title: "Error",
          description: "Failed to load your big rocks.",
          variant: "destructive",
        })
      } else {
        setRocks(rocksData || [])
      }
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addRock = () => {
    const newRock: BigRock = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      quadrant: "q2", // Default to Q2 (Important, Not Urgent)
      order: rocks.length,
      user_id: user?.id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setRocks([...rocks, newRock])
  }

  const updateRock = (id: string, data: Partial<BigRock>) => {
    setRocks(rocks.map((rock) => (rock.id === id ? { ...rock, ...data } : rock)))
  }

  const deleteRock = (id: string) => {
    setRocks(rocks.filter((rock) => rock.id !== id))
  }

  const moveRock = (dragIndex: number, hoverIndex: number) => {
    const dragRock = rocks[dragIndex]
    const newRocks = [...rocks]
    newRocks.splice(dragIndex, 1)
    newRocks.splice(hoverIndex, 0, dragRock)

    // Update order
    const reorderedRocks = newRocks.map((rock, index) => ({
      ...rock,
      order: index,
    }))

    setRocks(reorderedRocks)
  }

  const saveRocks = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Check if the big_rocks table exists
      const { data: tableExists, error: tableError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "big_rocks")
        .eq("table_schema", "public")

      if (tableError || !tableExists) {
        // Create the table if it doesn't exist
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS big_rocks (
            id UUID PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            quadrant TEXT NOT NULL,
            role_id UUID,
            due_date DATE,
            order INTEGER NOT NULL,
            user_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await supabase.rpc("execute_sql", { sql: createTableSQL })

        if (createError) {
          console.error("Error creating big_rocks table:", createError)
          throw new Error("Failed to create big_rocks table")
        }
      }

      // Delete existing rocks for this user
      const { error: deleteError } = await supabase.from("big_rocks").delete().eq("user_id", user.id)

      if (deleteError) {
        throw deleteError
      }

      // Insert new rocks
      if (rocks.length > 0) {
        const { error: insertError } = await supabase.from("big_rocks").insert(
          rocks.map((rock) => ({
            ...rock,
            user_id: user.id,
          })),
        )

        if (insertError) {
          throw insertError
        }
      }

      toast({
        title: "Saved",
        description: "Your big rocks have been saved.",
      })
    } catch (error) {
      console.error("Error saving big rocks:", error)
      toast({
        title: "Error",
        description: "Failed to save your big rocks.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Big Rocks Planning</CardTitle>
              <CardDescription>Focus on your most important priorities first</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {weekRange}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border mb-6">
              <h3 className="font-medium mb-2">The Big Rocks Principle</h3>
              <p className="text-sm text-muted-foreground">
                If you don't put the big rocks in first, you'll never get them in at all. Identify your most important
                priorities (big rocks) and schedule them before anything else.
              </p>
            </div>

            <div className="space-y-2">
              {rocks.map((rock, index) => (
                <BigRockItem
                  key={rock.id}
                  rock={rock}
                  index={index}
                  roles={roles}
                  moveRock={moveRock}
                  updateRock={updateRock}
                  deleteRock={deleteRock}
                />
              ))}

              {rocks.length === 0 && (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-muted-foreground mb-4">No big rocks added yet</p>
                  <Button onClick={addRock}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Big Rock
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={addRock}>
            <Plus className="h-4 w-4 mr-2" />
            Add Big Rock
          </Button>
          <Button onClick={saveRocks} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Big Rocks
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </DndProvider>
  )
}

