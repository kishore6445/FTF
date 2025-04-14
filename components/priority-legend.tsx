"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PriorityLegend() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Priority System</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    Use the priority system to organize your tasks. You can click the up/down arrows on each task to
                    reorder them and automatically update their priorities.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            A1
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 opacity-90">
            A2
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 opacity-80">
            A3
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            B1
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 opacity-90"
          >
            B2
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 opacity-80"
          >
            B3
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
            C1
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 opacity-90"
          >
            C2
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 opacity-80"
          >
            C3
          </Badge>
        </div>

        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="space-y-2">
              <h4 className="font-medium">A - Must do tasks (critical)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>A1: Highest priority critical tasks</li>
                <li>A2: Second highest critical tasks</li>
                <li>A3: Third highest critical tasks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">B - Should do tasks (important)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>B1: Highest priority important tasks</li>
                <li>B2: Second highest important tasks</li>
                <li>B3: Third highest important tasks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">C - Nice to do tasks (optional)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>C1: Highest priority optional tasks</li>
                <li>C2: Second highest optional tasks</li>
                <li>C3: Lowest priority tasks</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium mb-2">How to use the priority system:</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>
                <strong>Set the letter (A/B/C)</strong>: Determine how critical the task is
              </li>
              <li>
                <strong>Set the number (1-3)</strong>: Determine the priority within that category
              </li>
              <li>
                <strong>Reorder tasks</strong>: Use the up/down arrows on each task to automatically adjust priorities
              </li>
              <li>
                <strong>Focus on A1 tasks first</strong>: Complete your highest priority tasks before moving to lower
                priorities
              </li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

