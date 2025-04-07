import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SharpeningTheSaw from "@/components/sharpening-the-saw"

export const dynamic = "force-dynamic"

export default function SharpeningTheSawPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <SharpeningTheSaw />
    </Suspense>
  )
}

