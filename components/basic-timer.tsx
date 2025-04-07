"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

export default function BasicTimer() {
  const [seconds, setSeconds] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Effect for timer
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only set up interval if timer is running
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            // Stop the timer when it reaches zero
            setIsRunning(false)
            clearInterval(intervalRef.current as NodeJS.Timeout)
            intervalRef.current = null
            return 0
          }
          return prevSeconds - 1
        })
      }, 1000)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning]) // Only re-run if isRunning changes

  // Start timer
  const startTimer = () => {
    if (seconds > 0) {
      setIsRunning(true)
    }
  }

  // Stop timer
  const stopTimer = () => {
    setIsRunning(false)
  }

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(60)
  }

  return (
    <div className="p-4 border rounded-md max-w-sm mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center mb-4">Basic Timer</h2>

      <div className="text-6xl font-mono text-center mb-6">{seconds}</div>

      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <Button onClick={startTimer} disabled={seconds === 0}>
            Start
          </Button>
        ) : (
          <Button onClick={stopTimer}>Stop</Button>
        )}
        <Button variant="outline" onClick={resetTimer}>
          Reset
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-500">Timer status: {isRunning ? "Running" : "Stopped"}</div>
    </div>
  )
}

