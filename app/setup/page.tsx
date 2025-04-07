import type { Metadata } from "next"
import DatabaseSetupWizard from "@/components/database-setup-wizard"

export const metadata: Metadata = {
  title: "Database Setup | FirstThings",
  description: "Set up your database for FirstThings",
}

export default function SetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Database Setup</h1>
      <DatabaseSetupWizard />

      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">What this setup does:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Creates all necessary tables in your Supabase database</li>
          <li>Sets up proper relationships between tables</li>
          <li>Creates indexes for better performance</li>
          <li>Ensures the pomodoro_sessions table exists for time tracking</li>
          <li>Prepares your database for all FirstThings features</li>
        </ul>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-900">
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-2">Having trouble?</h3>
          <p className="text-amber-700 dark:text-amber-400 mb-2">If you're experiencing connection issues, you can:</p>
          <ul className="list-disc pl-5 text-amber-700 dark:text-amber-400">
            <li>Check your Supabase URL and API key in your environment variables</li>
            <li>Try using Mock Mode for development without a database</li>
            <li>Ensure your Supabase project is active and accessible</li>
            <li>Check for any network restrictions or CORS issues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

