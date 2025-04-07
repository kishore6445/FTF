import { CardDescription } from "@/components/ui/card"
import type { Metadata } from "next"
import PersonalMissionStatement from "@/components/personal-mission-statement"
import BigRocksPlanning from "@/components/big-rocks-planning"
import SharpeningTheSaw from "@/components/sharpening-the-saw"
import WeeklyReview from "@/components/weekly-review"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Target, RefreshCw, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Franklin Covey - 7 Habits",
  description: "Implement the principles from Stephen Covey's 7 Habits of Highly Effective People",
}

export default function FranklinCoveyPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Franklin Covey Principles</h1>
        <p className="text-muted-foreground">Implement the 7 Habits of Highly Effective People in your daily life</p>
      </div>

      <Tabs defaultValue="mission" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto">
          <TabsTrigger value="mission" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>Mission & Values</span>
          </TabsTrigger>
          <TabsTrigger value="big-rocks" className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            <span>Big Rocks</span>
          </TabsTrigger>
          <TabsTrigger value="sharpen" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Sharpen the Saw</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            <span>Weekly Review</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mission" className="space-y-4">
          <PersonalMissionStatement />
        </TabsContent>

        <TabsContent value="big-rocks" className="space-y-4">
          <BigRocksPlanning />
        </TabsContent>

        <TabsContent value="sharpen" className="space-y-4">
          <SharpeningTheSaw />
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <WeeklyReview />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>The 7 Habits Overview</CardTitle>
          <CardDescription>A quick reference to Stephen Covey's 7 Habits of Highly Effective People</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Habit 1: Be Proactive</h3>
              <p className="text-sm text-muted-foreground">
                Take initiative in life by realizing your decisions are the primary determining factor for effectiveness
                in your life.
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Habit 2: Begin with the End in Mind</h3>
              <p className="text-sm text-muted-foreground">
                Self-discover and clarify your deeply important character values and life goals. Envision the ideal
                characteristics for each of your various roles and relationships in life.
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Habit 3: Put First Things First</h3>
              <p className="text-sm text-muted-foreground">
                Prioritize, plan, and execute your week's tasks based on importance rather than urgency. Evaluate if
                your efforts exemplify your desired character values, propel you toward goals, and enrich the roles and
                relationships elaborated in Habit 2.
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Habit 4: Think Win-Win</h3>
              <p className="text-sm text-muted-foreground">
                Genuinely strive for mutually beneficial solutions or agreements in your relationships. Value and
                respect people by understanding a 'win' for all is ultimately a better long-term resolution than if only
                one person in the situation had gotten their way.
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Habit 5: Seek First to Understand, Then to Be Understood</h3>
              <p className="text-sm text-muted-foreground">
                Use empathic listening to be genuinely influenced by a person, which compels them to reciprocate the
                listening and take an open mind to being influenced by you. This creates an atmosphere of caring, and
                positive problem-solving.
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Habit 6: Synergize</h3>
              <p className="text-sm text-muted-foreground">
                Combine the strengths of people through positive teamwork, so as to achieve goals that no one could have
                done alone.
              </p>
            </div>

            <div className="p-4 border rounded-md md:col-span-2 lg:col-span-1">
              <h3 className="font-medium mb-2">Habit 7: Sharpen the Saw</h3>
              <p className="text-sm text-muted-foreground">
                Balance and renew your resources, energy, and health to create a sustainable, long-term, effective
                lifestyle. This includes physical, mental, spiritual, and social/emotional aspects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

