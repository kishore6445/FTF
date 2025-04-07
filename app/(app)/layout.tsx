import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css";

import { Toaster } from "@/components/ui/use-toast"
import { AuthProvider } from "@/contexts/auth-context"
import { RolesProvider } from "@/contexts/roles-context"
import { TasksProvider } from "@/contexts/tasks-context"
import { PomodoroProvider } from "@/contexts/pomodoro-context"
import { Navbar } from "@/components/navbar"
import { GlobalTaskButton } from "@/components/global-task-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FirstThings - Covey Task Manager",
  description: "A task management app based on Stephen Covey's principles",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RolesProvider>
            <TasksProvider>
              <PomodoroProvider>
                <Navbar />
                {children}
                <GlobalTaskButton />
                <Toaster />
              </PomodoroProvider>
            </TasksProvider>
          </RolesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

