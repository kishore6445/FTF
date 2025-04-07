"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"

export default function RitualDiagnosticTool() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string>("")
  const [ritualId, setRitualId] = useState<string>("")
  const [rituals, setRituals] = useState<any[]>([])
  const [newRitualTitle, setNewRitualTitle] = useState("")
  const [directSql, setDirectSql] = useState("")
  const { user } = useAuth()

  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    if (user) {
      fetchRituals()
    }
  }, [user])

  const fetchRituals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase.from("rituals").select("*").eq("user_id", user.id)

      if (error) {
        appendResult(`Error fetching rituals: ${error.message}`)
      } else {
        setRituals(data || [])
        appendResult(`Found ${data?.length || 0} rituals`)
      }
    } catch (error: any) {
      appendResult(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const appendResult = (text: string) => {
    setResults((prev) => `${prev}${prev ? "\n" : ""}${new Date().toLocaleTimeString()}: ${text}`)
  }

  const clearResults = () => {
    setResults("")
  }

  const createRitual = async () => {
    if (!user || !newRitualTitle.trim()) return

    setLoading(true)
    try {
      const newId = uuidv4()
      appendResult(`Creating ritual with ID: ${newId}`)

      const { data, error } = await supabase
        .from("rituals")
        .insert({
          id: newId,
          title: newRitualTitle,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        appendResult(`Error creating ritual: ${error.message}`)
      } else {
        appendResult(`Ritual created successfully: ${JSON.stringify(data)}`)
        setNewRitualTitle("")
        fetchRituals()
      }
    } catch (error: any) {
      appendResult(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async () => {
    if (!user || !ritualId) return

    setLoading(true)
    try {
      const completionId = uuidv4()
      appendResult(`Marking ritual ${ritualId} as complete with ID: ${completionId}`)

      const { data, error } = await supabase
        .from("ritual_completions")
        .insert({
          id: completionId,
          ritual_id: ritualId,
          user_id: user.id,
          date: new Date().toISOString(),
        })
        .select()

      if (error) {
        appendResult(`Error marking complete: ${error.message}`)

        // Try a different approach if the first one fails
        appendResult("Trying alternative approach...")

        const { data: data2, error: error2 } = await supabase.rpc("toggle_ritual_completion", {
          p_ritual_id: ritualId,
          p_user_id: user.id,
          p_date: today,
        })

        if (error2) {
          appendResult(`Alternative approach failed: ${error2.message}`)
        } else {
          appendResult(`Alternative approach result: ${JSON.stringify(data2)}`)
        }
      } else {
        appendResult(`Marked complete successfully: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      appendResult(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    if (!user) return

    setLoading(true)
    try {
      appendResult("Checking database tables...")

      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .in("table_name", ["rituals", "ritual_completions"])
        .eq("table_schema", "public")

      if (error) {
        appendResult(`Error checking tables: ${error.message}`)
      } else {
        const tables = data?.map((t) => t.table_name) || []
        appendResult(`Found tables: ${tables.join(", ")}`)

        // Check columns in rituals table
        if (tables.includes("rituals")) {
          const { data: columns, error: columnsError } = await supabase
            .from("information_schema.columns")
            .select("column_name, data_type")
            .eq("table_name", "rituals")
            .eq("table_schema", "public")

          if (columnsError) {
            appendResult(`Error checking ritual columns: ${columnsError.message}`)
          } else {
            appendResult(`Ritual columns: ${JSON.stringify(columns)}`)
          }
        }

        // Check columns in ritual_completions table
        if (tables.includes("ritual_completions")) {
          const { data: columns, error: columnsError } = await supabase
            .from("information_schema.columns")
            .select("column_name, data_type")
            .eq("table_name", "ritual_completions")
            .eq("table_schema", "public")

          if (columnsError) {
            appendResult(`Error checking completion columns: ${columnsError.message}`)
          } else {
            appendResult(`Completion columns: ${JSON.stringify(columns)}`)
          }

          // Check constraints
          const { data: constraints, error: constraintsError } = await supabase
            .from("information_schema.table_constraints")
            .select("constraint_name, constraint_type")
            .eq("table_name", "ritual_completions")
            .eq("table_schema", "public")

          if (constraintsError) {
            appendResult(`Error checking constraints: ${constraintsError.message}`)
          } else {
            appendResult(`Constraints: ${JSON.stringify(constraints)}`)
          }
        }
      }
    } catch (error: any) {
      appendResult(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const executeDirectSql = async () => {
    if (!user || !directSql.trim()) return

    setLoading(true)
    try {
      appendResult(`Executing SQL: ${directSql}`)

      // This is a workaround to execute direct SQL
      // Note: This requires appropriate permissions in Supabase
      const { data, error } = await supabase.rpc("execute_sql", {
        sql_string: directSql,
      })

      if (error) {
        appendResult(`SQL execution error: ${error.message}`)
      } else {
        appendResult(`SQL execution result: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      appendResult(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const recreateRitualCompletionsTable = async () => {
    if (!user) return

    setLoading(true)
    try {
      appendResult("Attempting to recreate ritual_completions table...")

      const sql = `
      DROP TABLE IF EXISTS ritual_completions;
      
      CREATE TABLE ritual_completions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ritual_id UUID NOT NULL,
        user_id UUID NOT NULL,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT ritual_completions_ritual_id_fkey 
          FOREIGN KEY (ritual_id) 
          REFERENCES rituals(id) ON DELETE CASCADE,
        CONSTRAINT ritual_completions_user_id_fkey 
          FOREIGN KEY (user_id) 
          REFERENCES auth.users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id 
        ON ritual_completions(ritual_id);
      CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id 
        ON ritual_completions(user_id);
      CREATE INDEX IF NOT EXISTS idx_ritual_completions_date 
        ON ritual_completions(date);
      `

      const { data, error } = await supabase.rpc("execute_sql", {
        sql_string: sql,
      })

      if (error) {
        appendResult(`Error recreating table: ${error.message}`)
      } else {
        appendResult(`Table recreation result: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      appendResult(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ritual Diagnostic Tool</CardTitle>
          <CardDescription>Troubleshoot issues with ritual tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="results">Diagnostic Results</Label>
            <Textarea id="results" value={results} readOnly className="font-mono text-xs h-40" />
            <div className="flex justify-end mt-2">
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Database Checks</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={checkTables} disabled={loading || !user}>
                  Check Tables
                </Button>
                <Button variant="outline" onClick={fetchRituals} disabled={loading || !user}>
                  Fetch Rituals
                </Button>
                <Button variant="destructive" onClick={recreateRitualCompletionsTable} disabled={loading || !user}>
                  Recreate Completions Table
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newRitual">Create New Ritual</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="newRitual"
                  value={newRitualTitle}
                  onChange={(e) => setNewRitualTitle(e.target.value)}
                  placeholder="Ritual title"
                  disabled={loading}
                />
                <Button onClick={createRitual} disabled={loading || !newRitualTitle.trim() || !user}>
                  Create
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="ritualSelect">Mark Ritual as Complete</Label>
              <div className="flex gap-2 mt-2">
                <select
                  id="ritualSelect"
                  value={ritualId}
                  onChange={(e) => setRitualId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading || rituals.length === 0}
                >
                  <option value="">Select a ritual</option>
                  {rituals.map((ritual) => (
                    <option key={ritual.id} value={ritual.id}>
                      {ritual.title}
                    </option>
                  ))}
                </select>
                <Button onClick={markComplete} disabled={loading || !ritualId || !user}>
                  Mark Complete
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="directSql">Execute Direct SQL (Advanced)</Label>
              <Textarea
                id="directSql"
                value={directSql}
                onChange={(e) => setDirectSql(e.target.value)}
                placeholder="INSERT INTO ritual_completions (id, ritual_id, user_id, date) VALUES ('uuid', 'ritual_uuid', 'user_uuid', CURRENT_TIMESTAMP);"
                className="font-mono text-xs h-20 mt-2"
                disabled={loading}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={executeDirectSql} disabled={loading || !directSql.trim() || !user} variant="outline">
                  Execute SQL
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">{user ? `Logged in as: ${user.email}` : "Not logged in"}</p>
          <p className="text-xs text-muted-foreground">{loading ? "Processing..." : "Ready"}</p>
        </CardFooter>
      </Card>
    </div>
  )
}

