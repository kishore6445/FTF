"use client"
export const dynamic = "force-dynamic";

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { ReactNode } from "react"

interface DndWrapperProps {
  children: ReactNode
}

export default function DndWrapper({ children }: DndWrapperProps) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>
}

