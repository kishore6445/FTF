"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { setupWeeklyPlannerTables, checkWeeklyPlannerTablesExist } from "@/lib/setup-weekly-planner"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function SetupWeeklyPlannerPage() {
  const [loading, setLoading] = useState(true)
  const [setupInProgress, setSetupInProgress] = useState(false)
  const [tablesExist, setTablesExist] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function checkTables() {
      setLoading(true)
      const result = await checkWeeklyPlannerTablesExist()
      setTablesExist(result.exists)
      setError(result.error)
      setLoading(false)
    }

    checkTables()
  }, [])

  const handleSetup = async () => {
    setSetupInProgress(true)
    setError(null)

    const result = await setupWeeklyPlannerTables()

    if (result.success) {
      setTablesExist(true)
      toast({
        title: "Success",
        description: "Weekly planner tables have been set up successfully.",
      })
    } else {
      setError(result.error || "Failed to set up weekly planner tables")
      toast({
        title: "Setup Failed",
        description: result.error || "Failed to set up weekly planner tables",
        variant: "destructive",
      })
    }

    setSetupInProgress(false)
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary" />
            Weekly Planner Setup
          </CardTitle>
          <CardDescription>Set up the database tables required for the weekly planner feature</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : tablesExist ? (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Tables Already Exist</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                The weekly planner tables are already set up. You can now use the weekly planner feature.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">Tables Not Found</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  The weekly planner tables don't exist yet. Click the button below to set them up.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">What This Will Do</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This setup will create the following tables in your Supabase database:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>weekly_plans - For storing weekly planning information</li>
                  <li>weekly_big_rocks - For storing your most important priorities</li>
                  <li>daily_plans - For storing daily planning information</li>
                  <li>time_blocks - For scheduling your day</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/planner">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Planner
            </Link>
          </Button>
          {!tablesExist && (
            <Button onClick={handleSetup} disabled={setupInProgress}>
              {setupInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Set Up Weekly Planner Tables
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

