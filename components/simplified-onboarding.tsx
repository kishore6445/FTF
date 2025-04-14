"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, Check, Target, Grid2X2 } from "lucide-react"

export default function SimplifiedOnboarding() {
  const [step, setStep] = useState(1)
  const totalSteps = 5

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Covey Planner</CardTitle>
          <CardDescription>Let's set up your account to help you be more effective</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress value={(step / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Getting Started</span>
              <span>
                Step {step} of {totalSteps}
              </span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Define Your Mission Statement</h2>
              <p className="text-muted-foreground">
                Your personal mission statement defines who you are and what you stand for. It guides your decisions and
                actions.
              </p>
              <div className="space-y-2">
                <Label htmlFor="mission">My Mission Statement</Label>
                <Textarea
                  id="mission"
                  placeholder="E.g., To live with integrity, contribute positively to others, and continuously grow as a person..."
                  rows={5}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Define Your Life Roles</h2>
              <p className="text-muted-foreground">
                Identify the key roles you play in your life. These help you maintain balance and ensure you're focusing
                on what matters most.
              </p>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`role-${index}`}>Role {index}</Label>
                      <Input id={`role-${index}`} placeholder={`E.g., Parent, Professional, Friend`} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`role-desc-${index}`}>Description</Label>
                      <Input id={`role-desc-${index}`} placeholder="Brief description of this role" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  + Add Another Role
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Set Your Big Rocks</h2>
              <p className="text-muted-foreground">
                What are the most important priorities in your life right now? These "big rocks" should be placed in
                your schedule first.
              </p>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`big-rock-${index}`}>Big Rock {index}</Label>
                    <Input
                      id={`big-rock-${index}`}
                      placeholder={`E.g., Complete project proposal, Family time on weekends`}
                    />
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  + Add Another Big Rock
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">You're All Set!</h2>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Setup Complete
                </h3>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  Your Covey Planner is ready to use. Here's what you can do next:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="border-2 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Plan Your Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Start by planning your week, focusing on your big rocks first.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="sm">
                      Go to Weekly Planner
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Grid2X2 className="h-5 w-5 text-blue-500" />
                      Manage Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Add and organize your tasks using the Covey Quadrants.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" size="sm">
                      Go to Quadrants
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button>
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

