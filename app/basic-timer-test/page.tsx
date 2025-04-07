"use client"

import BasicTimer from "@/components/basic-timer"

export default function BasicTimerTestPage() {
  console.log("Basic timer test page rendered")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Basic Timer Test</h1>
      <p className="mb-8">This is the simplest possible timer implementation.</p>

      <BasicTimer />

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="font-bold mb-2">Debugging Instructions:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open your browser's developer console (F12 or right-click → Inspect → Console)</li>
          <li>Click the Start button and watch for console messages</li>
          <li>If you see "Interval tick" messages, the timer is working</li>
          <li>If you don't see these messages, there might be an issue with your browser or React environment</li>
        </ol>
      </div>
    </div>
  )
}

