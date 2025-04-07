"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutGrid, ListTodo, Calendar, Settings, Menu, X, Target, Compass, BookOpen, Clock, Grid } from "lucide-react"

export default function SimplifiedNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      name: "Quadrants_test",
      href: "/quadrants",
      icon: <Grid className="h-5 w-5" />,
    },
    {
      name: "Task Inbox",
      href: "/task-inbox",
      icon: <ListTodo className="h-5 w-5" />,
    },
    {
      name: "Weekly Planner",
      href: "/planner",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Franklin Planner",
      href: "/franklin-planner",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Daily Rituals",
      href: "/daily-rituals",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Mission & Vision",
      href: "/mission-vision",
      icon: <Compass className="h-5 w-5" />,
    },
    {
      name: "Big Rocks",
      href: "/big-rocks",
      icon: <Target className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-lg">FirstThings</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b pb-4">
          <div className="container mx-auto px-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button variant={isActive(item.href) ? "default" : "ghost"} size="sm" className="w-full justify-start">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

