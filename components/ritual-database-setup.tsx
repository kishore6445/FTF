"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Database, RefreshCw, Copy, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

interface RitualDatabaseSetupProps {
  onSetupComplete?: () => void
}

export function RitualDatabaseSetup({ onSetupComplete }: RitualDatabaseSetupProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"checking" | "ready" | "not-ready">("checking")
  const [logs, setLogs] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setStatus("checking")
    setLogs(["Checking database status..."])

    try {
      // Try to query the rituals table directly
      const { data: ritualsData, error: ritualsError } = await supabase
        .from("rituals")
        .select("id")
        .limit(1)
        .maybeSingle()

      // Try to query the ritual_completions table directly
      const { data: completionsData, error: completionsError } = await supabase
        .from("ritual_completions")
        .select("id")
        .limit(1)
        .maybeSingle()

      // Check if the errors are "relation does not exist" errors
      const ritualsNotExist = ritualsError && ritualsError.message.includes('relation "rituals" does not exist')
      const completionsNotExist =
        completionsError && completionsError.message.includes('relation "ritual_completions" does not exist')

      if (ritualsNotExist || completionsNotExist) {
        setLogs((prev) => [...prev, "Database tables not found. Setup required."])
        setStatus("not-ready")
      } else if (ritualsError || completionsError) {
        // Other errors occurred
        setLogs((prev) => [
          ...prev,
          `Error checking rituals table: ${ritualsError?.message || "None"}`,
          `Error checking completions table: ${completionsError?.message || "None"}`,
        ])
        setStatus("not-ready")
      } else {
        setLogs((prev) => [...prev, "Database tables found and ready to use."])
        setStatus("ready")
        if (onSetupComplete) {
          onSetupComplete()
        }
      }
    } catch (error: any) {
      console.error("Error checking database status:", error)
      setLogs((prev) => [...prev, `Error checking database status: ${error.message || "Unknown error"}`])
      setStatus("not-ready")
    }
  }

  const setupDatabase = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to set up the database.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLogs((prev) => [...prev, "Setting up database tables..."])

    try {
      // Try to create a placeholder ritual to force table creation
      const { error: createRitualError } = await supabase.from("rituals").insert({
        title: "Setup Placeholder",
        description: "This is a placeholder ritual created during setup.",
        user_id: user.id,
        category: "general",
        time_of_day: "morning",
        days_of_week: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      })

      if (createRitualError) {
        if (createRitualError.message.includes('relation "rituals" does not exist')) {
          setLogs((prev) => [...prev, "The rituals table doesn't exist. Please use the SQL tab to create it manually."])
        } else {
          setLogs((prev) => [...prev, `Error creating ritual: ${createRitualError.message}`])
        }
        return
      }

      setLogs((prev) => [...prev, "Successfully created a placeholder ritual."])

      // Get the ID of the ritual we just created
      const { data: ritualData, error: fetchRitualError } = await supabase
        .from("rituals")
        .select("id")
        .eq("title", "Setup Placeholder")
        .eq("user_id", user.id)
        .single()

      if (fetchRitualError || !ritualData) {
        setLogs((prev) => [...prev, `Error fetching ritual: ${fetchRitualError?.message || "No data returned"}`])
        return
      }

      // Try to create a placeholder completion
      const { error: createCompletionError } = await supabase.from("ritual_completions").insert({
        ritual_id: ritualData.id,
        user_id: user.id,
        missed: false,
      })

      if (createCompletionError) {
        if (createCompletionError.message.includes('relation "ritual_completions" does not exist')) {
          setLogs((prev) => [
            ...prev,
            "The ritual_completions table doesn't exist. Please use the SQL tab to create it manually.",
          ])
        } else {
          setLogs((prev) => [...prev, `Error creating completion: ${createCompletionError.message}`])
        }
        return
      }

      setLogs((prev) => [...prev, "Successfully created a placeholder completion."])
      setStatus("ready")

      toast({
        title: "Database setup complete",
        description: "Ritual tables have been created successfully.",
      })

      if (onSetupComplete) {
        onSetupComplete()
      }
    } catch (error: any) {
      console.error("Error setting up database:", error)
      setLogs((prev) => [...prev, `Error setting up database: ${error.message || "Unknown error"}`])

      toast({
        title: "Database setup failed",
        description:
          "There was an error setting up the database tables. Please try using the SQL tab to create them manually.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "SQL copied to clipboard",
      description: "You can now paste this into the Supabase SQL editor.",
    })
  }

  const createTablesSQL = `
-- Create rituals table
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  category TEXT DEFAULT 'general',
  time_of_day TEXT DEFAULT 'morning',
  days_of_week TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
);

CREATE INDEX IF NOT EXISTS idx_rituals_user_id ON rituals(user_id);

-- Create ritual_completions table
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL,
  missed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);
  `.trim()

  if (status === "ready") {
    return null // Don't show anything if the database is ready
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Ritual Database Setup
        </CardTitle>
        <CardDescription>The ritual tables need to be created before you can use this feature.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auto">
          <TabsList className="mb-4">
            <TabsTrigger value="auto">Automatic Setup</TabsTrigger>
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="auto">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto border rounded-md p-2">
                {logs.map((log, index) => (
                  <div key={index} className="py-1">
                    {log}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button onClick={setupDatabase} disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Setup Database"}
                </Button>

                <Button variant="outline" onClick={checkDatabaseStatus} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-4">
              <div className="text-sm">
                <p className="mb-2">
                  If automatic setup fails, you can manually create the tables by running the following SQL in the
                  Supabase SQL editor:
                </p>

                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">{createTablesSQL}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(createTablesSQL)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <ol className="mt-4 space-y-2 list-decimal list-inside">
                  <li>
                    Go to the{" "}
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Supabase Dashboard
                    </a>
                  </li>
                  <li>Select your project</li>
                  <li>Go to the SQL Editor</li>
                  <li>Create a new query</li>
                  <li>Paste the SQL above</li>
                  <li>Run the query</li>
                  <li>Come back here and click "Refresh Status"</li>
                </ol>
              </div>

              <Button variant="outline" onClick={checkDatabaseStatus} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

