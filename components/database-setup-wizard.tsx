"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Database, Check, AlertCircle, RefreshCw } from "lucide-react"
import { setupDatabase, checkSupabaseConnection } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { supabase } from "@/lib/supabase"

export default function DatabaseSetupWizard() {
  const [status, setStatus] = useState<"checking" | "idle" | "setting_up" | "success" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [setupLog, setSetupLog] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    tablesExist: boolean
    error?: any
    mockMode?: boolean
  } | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setStatus("checking")
    setErrorMessage(null)

    try {
      const result = await checkSupabaseConnection()
      setConnectionStatus(result)

      if (result.mockMode) {
        // If in mock mode, we can't really check tables
        setStatus("idle")
      } else if (result.connected) {
        if (result.tablesExist) {
          setStatus("success")
        } else {
          setStatus("idle")
        }
      } else {
        setStatus("error")
        setErrorMessage(
          typeof result.error === "string"
            ? result.error
            : "Failed to connect to the database. Please check your connection settings.",
        )
      }
    } catch (error) {
      console.error("Error checking connection:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      setConnectionStatus(null)
    }
  }

  const handleSetupDatabase = async () => {
    setStatus("setting_up")
    setErrorMessage(null)
    setSetupLog([])
    setProgress(0)

    try {
      // Add initial log
      setSetupLog(["Starting database setup..."])

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)

      const { success, logs } = await setupDatabase()

      // Clear the interval
      clearInterval(progressInterval)

      // Update logs
      setSetupLog(logs || [])

      if (success) {
        setProgress(100)
        setStatus("success")
      } else {
        throw new Error("Failed to set up database tables")
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      setStatus("error")
      setProgress(0)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    checkConnection().finally(() => setIsRetrying(false))
  }

  const handleCreateRenewalActivitiesTable = async () => {
    setStatus("setting_up")
    setErrorMessage(null)
    setSetupLog(["Creating renewal_activities table..."])
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)

      // Create the renewal_activities table
      const { error } = await supabase.rpc("create_renewal_activities_table")

      clearInterval(progressInterval)

      if (error) {
        console.error("Error creating renewal_activities table:", error)
        setStatus("error")
        setProgress(0)
        setErrorMessage(error.message || "Failed to create renewal_activities table")
        setSetupLog((prev) => [...prev, `Error: ${error.message}`])
        return
      }

      setProgress(100)
      setStatus("success")
      setSetupLog((prev) => [...prev, "Successfully created renewal_activities table!"])
    } catch (error) {
      console.error("Error in handleCreateRenewalActivitiesTable:", error)
      setStatus("error")
      setProgress(0)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  // Render based on status
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Set up the required database tables for FirstThings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === "checking" && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Checking database connection...</span>
            </div>
          )}

          {status === "idle" && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
              <AlertTitle className="text-blue-800 dark:text-blue-300">Database Setup Required</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Your database needs to be set up with the required tables before you can use the application. Click the
                button below to create the necessary tables.
              </AlertDescription>
            </Alert>
          )}

          {status === "setting_up" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Setting up database tables...</span>
              </div>
              <Progress value={progress} className="h-2" />

              {setupLog.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="logs">
                    <AccordionTrigger>View Setup Logs</AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs font-mono h-40 overflow-y-auto">
                        {setupLog.map((log, index) => (
                          <div key={index} className="mb-1">
                            {log}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Database Setup Complete</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Database setup completed successfully! All required tables have been created. You can now use the
                application.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Setup Error</AlertTitle>
              <AlertDescription>
                {errorMessage || "Failed to set up database. Please try again or contact support."}
              </AlertDescription>
            </Alert>
          )}

          {setupLog.length > 0 && status !== "setting_up" && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="logs">
                <AccordionTrigger>View Setup Logs</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs font-mono h-40 overflow-y-auto">
                    {setupLog.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {status === "idle" && (
          <Button className="w-full" onClick={handleSetupDatabase}>
            <Database className="mr-2 h-4 w-4" />
            Set Up Database
          </Button>
        )}

        {status === "error" && (
          <div className="flex flex-col w-full gap-2">
            {status === "error" &&
              connectionStatus &&
              connectionStatus.error &&
              connectionStatus.error.message &&
              connectionStatus.error.message.includes("renewal_activities") && (
                <Button className="w-full" onClick={handleCreateRenewalActivitiesTable}>
                  <Database className="mr-2 h-4 w-4" />
                  Create Renewal Activities Table
                </Button>
              )}
            <Button className="w-full" onClick={handleSetupDatabase}>
              <Database className="mr-2 h-4 w-4" />
              Try Setup Again
            </Button>

            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Connection Again
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

