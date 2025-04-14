"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LogOut,
  User,
  CheckSquare,
  LayoutDashboard,
  Target,
  Calendar,
  Briefcase,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Sparkles,
  Clock,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export function Navbar() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Don't show navbar on landing page, login, or signup
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null
  }

  return (
   <header
     className={`sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
       scrolled ? "bg-background/95 shadow-sm" : "bg-background/80"
     }`}
   >
     <div className="container mx-auto px-4">
       <div className="flex justify-between items-center h-16">
         {/* Logo and Brand */}
         <div className="flex items-center gap-2">
           <Link href="/dashboard" className="flex items-center gap-2">
             <CheckSquare className="h-6 w-6 text-primary" />
             <span className="font-bold text-xl">FirstThings</span>
           </Link>
         </div>

         {/* Desktop Navigation */}
         <nav className="hidden md:flex items-center space-x-6">
           <Link
             href="/dashboard"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
             )}
           >
             <LayoutDashboard className="h-4 w-4" />
             Dashboard
           </Link>
           <Link
             href="/quadrants"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/quadrants" ? "text-primary" : "text-muted-foreground",
             )}
           >
             <Calendar className="h-4 w-4" />
             Quadrants
           </Link>
           <Link
             href="/mission-vision"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/mission-vision" ? "text-primary" : "text-muted-foreground",
             )}
           >
             <Target className="h-4 w-4" />
             Mission & Vision
           </Link>
           <Link
             href="/roles"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/roles" ? "text-primary" : "text-muted-foreground",
             )}
           >
             <Briefcase className="h-4 w-4" />
             Roles
           </Link>
           <Link
             href="/sharpening-the-saw"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/sharpening-the-saw" ? "text-primary" : "text-muted-foreground",
             )}
           >
             <Sparkles className="h-4 w-4" />
             Sharpening the Saw
           </Link>
           <Link
             href="/pomodoro-timer"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/pomodoro-timer" ? "text-primary" : "text-muted-foreground",
           )}
           >
             <Clock className="h-4 w-4" />
             Pomodoro Timer
           </Link>
           <Link
             href="/franklin-planner"
             className={cn(
               "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
               pathname === "/franklin-planner" ? "text-primary" : "text-muted-foreground",
             )}
           >
             <BookOpen className="h-4 w-4" />
             Franklin Planner
           </Link>
           <Link href="/add-ritual" className="text-sm font-medium transition-colors hover:text-primary">
             Add Ritual
           </Link>
         </nav>

         {/* Right side - User menu */}
         <div className="flex items-center gap-3">
           {/* Search button */}
           <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSearchOpen(!searchOpen)}>
             <Search className="h-5 w-5" />
           </Button>

           {/* Notifications */}
           {user ? (
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="relative">
                 <Bell className="h-5 w-5" />
                 <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">2</Badge>
             </Button>
           </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-80">
               <DropdownMenuLabel>
                 <div className="flex flex-col">
                   <p className="font-medium">{user?.email}</p>
                   <p className="text-xs text-muted-foreground">{user?.email?.split("@")[0]}</p>
                 </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => router.push("/profile")}>
                 <User className="mr-2 h-4 w-4" />
                 Profile
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => router.push("/roles")}>
                 <Briefcase className="mr-2 h-4 w-4" />
                 Manage Roles
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => router.push("/settings")}>
                 <Settings className="mr-2 h-4 w-4" />
                 Settings
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => router.push("/help")}>
                 <HelpCircle className="mr-2 h-4 w-4" />
                 Help & Support
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleSignOut}>
                 <LogOut className="mr-2 h-4 w-4" />
                 Logout
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         ) : (
           <Button variant="default" size="sm" onClick={() => router.push("/login")}>
             Sign In
           </Button>
         )}
       </div>
     </div>

     {/* Search overlay */}
     {searchOpen && (
       <div className="absolute inset-x-0 top-16 bg-background border-b p-4 animate-fade-in-up">
         <div className="container mx-auto">container mx-auto">
           <Input
             placeholder="Search tasks, meetings, rituals..."
             className="w-full"
             autoFocus
             onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
           />
           <div className="mt-2 text-xs text-muted-foreground">Press ESC to close or Enter to search</div>
         </div>
       </div>
     )}

     {/* Mobile Navigation Menu */}
     {isMenuOpen && (
       <div className="md:hidden border-t p-4 animate-fade-in-up">
         <nav className="flex flex-col space-y-3">
           <Link
             href="/dashboard"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
               pathname === "/dashboard"
                 ? "bg-primary text-primary"
                 : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <LayoutDashboard className="h-4 w-4" />
             Dashboard
           </Link>
           <Link
             href="/quadrants"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
               pathname === "/quadrants"
                 ? "bg-primary text-primary"
                 : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <Calendar className="h-4 w-4" />
             Quadrants
           </Link>
           <Link
             href="/mission-vision"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
               pathname === "/mission-vision" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <Target className="h-4 w-4" />
             Mission & Vision
           </Link>
           <Link
             href="/roles"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
               pathname === "/roles" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <Briefcase className="h-4 w-4" />
             Roles
           </Link>
           <Link
             href="/sharpening-the-saw"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
               pathname === "/sharpening-the-saw"
                 ? "bg-primary text-primary"
                 : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <Sparkles className="h-4 w-4" />
             Sharpening the Saw
           </Link>
           <Link
             href="/pomodoro-timer"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
               pathname === "/pomodoro-timer"
                 ? "bg-primary text-primary"
                 : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <Clock className="h-4 w-4" />
             Pomodoro Timer
           </Link>
           <Link
             href="/franklin-planner"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
               pathname === "/franklin-planner"
                 ? "bg-primary text-primary"
                 : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <BookOpen className="h-4 w-4" />
             Franklin Planner
           </Link>
           <DropdownMenuSeparator />
           <Link
             href="/profile"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
               pathname === "/profile" ? "bg-primary text-primary" : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <User className="h-4 w-4" />
             Profile
           </Link>
           <Link
             href="/settings"
             className={cn(
               "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
               pathname === "/settings"
                 ? "bg-primary text-primary"
                 : "hover:bg-accent hover:text-accent-foreground",
             )}
             onClick={() => setIsMenuOpen(false)}
           >
             <Settings className="h-4 w-4" />
             Settings
           </Link>
           <Button variant="destructive" size="sm" className="mt-2 w-full justify-start" onClick={handleSignOut}>
             <LogOut className="h-4 w-4 mr-2" />
             Logout
           </Button>
         </nav>
       </div>
     </div>
   </header>
 )
}

