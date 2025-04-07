"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = React.createContext<{
  toast: (props: ToastProps) => void
}>({
  toast: () => {},
})

export function useToast() {
  const context = React.useContext(ToastProvider)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export function Toast({
  className,
  variant,
  title,
  description,
  action,
  ...props
}: ToastProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
      <button className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])

    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, props.duration || 5000)
    }
  }, [])

  return (
    <ToastProvider.Provider value={{ toast }}>
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
      </div>
    </ToastProvider.Provider>
  )
}

// Add the ToastContainer component
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider.Provider value={{ toast: () => {} }}>
      {children}
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4"></div>
    </ToastProvider.Provider>
  )
}

