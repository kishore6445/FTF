"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Compass, Target, UserCircle, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"

export default function WeeklyPlanningGuide() {
  const [activeStep, setActiveStep] = useState("connect")
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    connect: false,
    roles: false,
    bigrocks: false,
    schedule: false,
    review: false,
  })

  const markStepComplete = (step: string) => {
    setCompleted((prev) => ({
      ...prev,
      [step]: true,
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          First Things First Weekly Planning
        </CardTitle>
        <CardDescription>Follow Stephen Covey's recommended weekly planning process</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="connect" className="flex flex-col items-center gap-1 py-2">
              <Compass className="h-4 w-4" />
              <span className="text-xs">Connect</span>
              {completed.connect && <CheckCircle2 className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex flex-col items-center gap-1 py-2">
              <UserCircle className="h-4 w-4" />
              <span className="text-xs">Roles</span>
              {completed.roles && <CheckCircle2 className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
            </TabsTrigger>
            <TabsTrigger value="bigrocks" className="flex flex-col items-center gap-1 py-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Big Rocks</span>
              {completed.bigrocks && <CheckCircle2 className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex flex-col items-center gap-1 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Schedule</span>
              {completed.schedule && <CheckCircle2 className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
            </TabsTrigger>
            <TabsTrigger value="review" className="flex flex-col items-center gap-1 py-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Review</span>
              {completed.review && <CheckCircle2 className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Connect with Your Mission & Vision</h3>
              <p className="text-sm text-muted-foreground">
                Begin your weekly planning by reconnecting with your personal mission statement and vision. This ensures
                your week is aligned with your deepest values and long-term direction.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission-reflection">Mission Reflection</Label>
              <Textarea
                id="mission-reflection"
                placeholder="How will I apply my mission statement this week?"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compass-check">Compass Check</Label>
              <Textarea
                id="compass-check"
                placeholder="What principles will guide my decisions this week?"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  markStepComplete("connect")
                  setActiveStep("roles")
                }}
                className="gap-2"
              >
                Continue to Roles <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Review Your Key Roles</h3>
              <p className="text-sm text-muted-foreground">
                Identify and reflect on your key roles (e.g., parent, professional, community member). Consider what
                success looks like in each role this week.
              </p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`role-${index}`}>Role {index}</Label>
                    <Input id={`role-${index}`} placeholder={`e.g., Parent, Professional, etc.`} />
                  </div>
                  <Textarea
                    placeholder="What does success look like in this role this week?"
                    className="min-h-[80px]"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep("connect")}>
                Back
              </Button>
              <Button
                onClick={() => {
                  markStepComplete("roles")
                  setActiveStep("bigrocks")
                }}
                className="gap-2"
              >
                Continue to Big Rocks <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bigrocks" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Identify Your Big Rocks</h3>
              <p className="text-sm text-muted-foreground">
                For each role, identify 1-2 "big rocks" - the most important tasks or goals that will make the biggest
                difference this week. These should be primarily Quadrant II activities.
              </p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md">
                  <Label className="font-medium">Role: [Role Name {index}]</Label>

                  <div className="space-y-2 pl-2 border-l-2 border-primary/30">
                    <div className="flex items-start gap-2">
                      <Checkbox id={`bigrock-${index}-1`} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`bigrock-${index}-1`}>Big Rock 1</Label>
                        <Input placeholder="Enter your first big rock for this role" />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox id={`bigrock-${index}-2`} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`bigrock-${index}-2`}>Big Rock 2</Label>
                        <Input placeholder="Enter your second big rock for this role" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep("roles")}>
                Back
              </Button>
              <Button
                onClick={() => {
                  markStepComplete("bigrocks")
                  setActiveStep("schedule")
                }}
                className="gap-2"
              >
                Continue to Schedule <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Schedule Your Big Rocks First</h3>
              <p className="text-sm text-muted-foreground">
                Now that you've identified your big rocks, schedule them into your week first, before other activities.
                This ensures your most important priorities get the time they need.
              </p>
            </div>

            <div className="p-3 border rounded-md space-y-2">
              <p className="text-sm font-medium">Your Big Rocks</p>
              <ul className="space-y-1 pl-5 list-disc text-sm">
                <li>Big Rock 1 from Role 1</li>
                <li>Big Rock 2 from Role 1</li>
                <li>Big Rock 1 from Role 2</li>
                <li>Big Rock 2 from Role 2</li>
                <li>Big Rock 1 from Role 3</li>
                <li>Big Rock 2 from Role 3</li>
              </ul>

              <div className="pt-2">
                <Button variant="secondary" size="sm">
                  Open Weekly Calendar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduling-notes">Scheduling Notes</Label>
              <Textarea
                id="scheduling-notes"
                placeholder="Notes about your schedule this week..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep("bigrocks")}>
                Back
              </Button>
              <Button
                onClick={() => {
                  markStepComplete("schedule")
                  setActiveStep("review")
                }}
                className="gap-2"
              >
                Continue to Review <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Weekly Review & Commitment</h3>
              <p className="text-sm text-muted-foreground">
                Review your plan for balance and completeness. Make any final adjustments and commit to following
                through on your most important priorities.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance-check">Balance Check</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox id="physical-dimension" />
                  <Label htmlFor="physical-dimension">Physical Dimension</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="mental-dimension" />
                  <Label htmlFor="mental-dimension">Mental Dimension</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="social-dimension" />
                  <Label htmlFor="social-dimension">Social/Emotional Dimension</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="spiritual-dimension" />
                  <Label htmlFor="spiritual-dimension">Spiritual Dimension</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commitment">Weekly Commitment</Label>
              <Textarea
                id="commitment"
                placeholder="What are you committing to accomplish this week, no matter what?"
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep("schedule")}>
                Back
              </Button>
              <Button
                onClick={() => {
                  markStepComplete("review")
                }}
                className="gap-2"
              >
                Complete Weekly Planning <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Pro tip:</span> Weekly planning is most effective when done at the same time
          each week.
        </div>
      </CardFooter>
    </Card>
  )
}

