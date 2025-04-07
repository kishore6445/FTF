"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, Check, AlertCircle } from "lucide-react"
import { setupDatabase } from "@/lib/supabase"

export default function DatabaseSetup() {
  const [status, setStatus] = useState<"idle" | "setting_up" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [setupLog, setSetupLog] = useState<string[]>([])

  const handleSetupDatabase = async () => {
    setStatus("setting_up")
    setErrorMessage(null)
    setSetupLog([])

    try {
      const { success, logs } = await setupDatabase()
      setSetupLog(logs || [])

      if (success) {
        setStatus("success")
      } else {
        throw new Error("Failed to set up database tables")
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Set up the required database tables for FirstThings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your Supabase database needs to be set up with the required tables before you can use the application. Click
            the button below to create the necessary tables.
          </p>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Database setup completed successfully! You can now use the application.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage || "Failed to set up database. Please try again or contact support."}
              </AlertDescription>
            </Alert>
          )}

          {setupLog.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs font-mono h-40 overflow-y-auto">
              {setupLog.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSetupDatabase} disabled={status === "setting_up"}>
          {status === "setting_up" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up...
            </>
          ) : status === "success" ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Setup Complete
            </>
          ) : (
            "Set Up Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

