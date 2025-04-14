"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

export default function LifePlanning() {
  const [eulogy, setEulogy] = useState("")
  const [visionWorksheets, setVisionWorksheets] = useState({
    tenYear: "",
    fiveYear: "",
    oneYear: "",
  })
  const [goals, setGoals] = useState({
    career: "",
    health: "",
    familyFriends: "",
    personal: "",
  })
  const [dailyReflection, setDailyReflection] = useState({
    doOverDifferently: "",
    gratitude: "",
    journalEntry: "",
  })

  const handleSave = (section: string) => {
    console.log(`Saving ${section}`)
    // Here you would typically save the data to your backend or local storage
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Life Planning</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="eulogy" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="eulogy">Eulogy</TabsTrigger>
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="reflection">Daily Reflection</TabsTrigger>
          </TabsList>

          <TabsContent value="eulogy">
            <div className="space-y-4">
              <Label htmlFor="eulogy">Your Eulogy</Label>
              <Textarea
                id="eulogy"
                value={eulogy}
                onChange={(e) => setEulogy(e.target.value)}
                placeholder="Write your eulogy here..."
                className="min-h-[200px]"
              />
              <Button onClick={() => handleSave("eulogy")}>
                <Save className="h-4 w-4 mr-2" /> Save Eulogy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="vision">
            <div className="space-y-4">
              {Object.entries(visionWorksheets).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} Vision
                  </Label>
                  <Textarea
                    id={key}
                    value={value}
                    onChange={(e) => setVisionWorksheets({ ...visionWorksheets, [key]: e.target.value })}
                    placeholder={`Write your ${key.replace(/([A-Z])/g, " $1").toLowerCase()} vision here...`}
                    className="min-h-[150px]"
                  />
                </div>
              ))}
              <Button onClick={() => handleSave("vision")}>
                <Save className="h-4 w-4 mr-2" /> Save Vision Worksheets
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="space-y-4">
              {Object.entries(goals).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} Goals
                  </Label>
                  <Textarea
                    id={key}
                    value={value}
                    onChange={(e) => setGoals({ ...goals, [key]: e.target.value })}
                    placeholder={`Write your ${key.replace(/([A-Z])/g, " $1").toLowerCase()} goals here...`}
                    className="min-h-[100px]"
                  />
                </div>
              ))}
              <Button onClick={() => handleSave("goals")}>
                <Save className="h-4 w-4 mr-2" /> Save Goals
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="reflection">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doOverDifferently">
                  If I were living this day over again what would I do differently?
                </Label>
                <Textarea
                  id="doOverDifferently"
                  value={dailyReflection.doOverDifferently}
                  onChange={(e) => setDailyReflection({ ...dailyReflection, doOverDifferently: e.target.value })}
                  placeholder="Enter your reflection here..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gratitude">What am I grateful for today?</Label>
                <Textarea
                  id="gratitude"
                  value={dailyReflection.gratitude}
                  onChange={(e) => setDailyReflection({ ...dailyReflection, gratitude: e.target.value })}
                  placeholder="Enter what you're grateful for..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="journalEntry">Journal Entry</Label>
                <Textarea
                  id="journalEntry"
                  value={dailyReflection.journalEntry}
                  onChange={(e) => setDailyReflection({ ...dailyReflection, journalEntry: e.target.value })}
                  placeholder="Write your journal entry here..."
                  className="min-h-[200px]"
                />
              </div>
              <Button onClick={() => handleSave("reflection")}>
                <Save className="h-4 w-4 mr-2" /> Save Daily Reflection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

