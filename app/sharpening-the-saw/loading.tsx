import { Loader2 } from "lucide-react"

export default function SharpeningTheSawLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium">Loading Sharpening the Saw...</h2>
      <p className="text-muted-foreground">Preparing your renewal activities</p>
    </div>
  )
}

