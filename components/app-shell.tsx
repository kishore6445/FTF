"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Menu,
  Grid2X2,
  Target,
  Compass,
  BookOpen,
  Settings,
  LogOut,
  Repeat,
  BarChart3,
  User,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

interface MobileNavProps {
  pathname: string
  isLandingPage: boolean
  setOpen: (open: boolean) => void
}

function MobileNav({ pathname, isLandingPage, setOpen }: MobileNavProps) {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Grid2X2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">FirstThings</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 px-2 py-4">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Franklin Planner - Highlighted */}
          <Link
            href="/franklin-planner"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              pathname === "/franklin-planner"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
            onClick={() => setOpen(false)}
          >
            <BookOpen className="h-4 w-4" />
            Franklin Planner
            <ChevronRight className="ml-auto h-4 w-4" />
          </Link>

          <Link
            href="/quadrants"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/quadrants" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Grid2X2 className="h-4 w-4" />
            Quadrants
          </Link>

          <Link
            href="/task-inbox"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/task-inbox" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <BarChart3 className="h-4 w-4" />
            Task Inbox
          </Link>

          <Separator className="my-2" />

          {/* Other navigation items */}
          <Link
            href="/mission-vision"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/mission-vision" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Compass className="h-4 w-4" />
            Mission & Vision
          </Link>
          <Link
            href="/big-rocks"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/big-rocks" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Target className="h-4 w-4" />
            Big Rocks
          </Link>
          <Link
            href="/daily-rituals"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/daily-rituals" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Repeat className="h-4 w-4" />
            Daily Rituals
          </Link>

          <Separator className="my-2" />

          <h3 className="mb-2 px-4 text-xs font-semibold text-foreground">Account</h3>
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
      </ScrollArea>
    </div>
  )
}

function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  // Skip rendering the shell on auth pages
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return <>{children}</>
  }

  const isLandingPage = pathname === "/"

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6 md:px-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pr-0">
            <MobileNav pathname={pathname} isLandingPage={isLandingPage} setOpen={setOpen} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Grid2X2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">FirstThings</span>
          </Link>
        </div>

        <div className="flex-1" />

        {/* Franklin Planner Button - Always Visible */}
        <Link href="/franklin-planner">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Franklin Planner
          </Button>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area with Sidebar */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default AppShell

