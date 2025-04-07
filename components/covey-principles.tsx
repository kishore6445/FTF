"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Clock, Target, Users, Lightbulb, Heart, RefreshCw, LayoutGrid } from "lucide-react"

export default function CoveyPrinciples() {
  const [activeTab, setActiveTab] = useState("habits")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stephen Covey's Principles</CardTitle>
          <CardDescription>
            Learn about the principles and habits that form the foundation of effective personal management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="habits" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>7 Habits</span>
              </TabsTrigger>
              <TabsTrigger value="quadrants" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span>Time Matrix</span>
              </TabsTrigger>
              <TabsTrigger value="principles" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>Key Principles</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="habits" className="space-y-4">
              <p className="text-muted-foreground mb-4">
                The 7 Habits of Highly Effective People is a self-help book written by Stephen Covey, first published in
                1989. The habits are organized into a framework that progresses from dependence to independence
                (self-mastery) and finally to interdependence (working with others).
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="habit1">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        1
                      </div>
                      <span>Be Proactive</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Take responsibility for your life. Understand that you have the freedom to choose your responses
                      to circumstances. Focus on your Circle of Influence rather than your Circle of Concern.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        When faced with a problem, ask "What can I do about this?" rather than blaming external factors.
                        Use proactive language: "I will" instead of "I can't" or "I have to."
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habit2">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        2
                      </div>
                      <span>Begin with the End in Mind</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Define your mission and goals in life. Envision what you want in the future so you can work and
                      plan towards it. Create a personal mission statement to guide your decisions.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        Write a personal mission statement that articulates your values and goals. Before starting any
                        project, clearly define what success looks like. Consider how your daily actions align with your
                        long-term vision.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habit3">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        3
                      </div>
                      <span>Put First Things First</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Prioritize and execute your most important tasks based on importance rather than urgency. This is
                      the practical fulfillment of Habits 1 and 2. The Time Management Matrix helps categorize tasks
                      into four quadrants based on urgency and importance.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        Use the Time Management Matrix to categorize your tasks. Focus on Quadrant II activities
                        (important but not urgent) to prevent crises. Schedule your priorities rather than prioritizing
                        your schedule.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habit4">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        4
                      </div>
                      <span>Think Win-Win</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Seek mutual benefit in all human interactions. This habit is about interpersonal leadership.
                      Win-win sees life as cooperative, not competitive, and is based on the paradigm that there's
                      plenty for everyone.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        In negotiations or conflicts, look for solutions that benefit all parties. Be willing to walk
                        away if a win-win solution isn't possible (Win-Win or No Deal). Create agreements that clearly
                        define expectations and outcomes.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habit5">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        5
                      </div>
                      <span>Seek First to Understand, Then to Be Understood</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Use empathic listening to genuinely understand a person, which compels them to reciprocate and
                      creates an atmosphere of caring, respect, and positive problem-solving.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        Practice empathic listening: listen with the intent to understand, not to reply. Ask clarifying
                        questions. Summarize what you've heard before offering your perspective. Avoid autobiographical
                        responses that shift the focus to your experiences.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habit6">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        6
                      </div>
                      <span>Synergize</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Combine the strengths of people through positive teamwork to achieve goals no one person could
                      have done alone. This is the habit of creative cooperation and values differences.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        Embrace diversity of thought and perspective in teams. Create an environment where people feel
                        safe to express ideas. Look for Third Alternatives that are better than individual solutions.
                        Celebrate and leverage the unique strengths of team members.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habit7">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        7
                      </div>
                      <span>Sharpen the Saw</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Preserve and enhance your greatest asset – yourself – by renewing the physical, spiritual, mental,
                      and social/emotional dimensions of your nature. This is the habit of self-renewal and balanced
                      self-care.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm">Application:</p>
                      <p className="text-sm mt-1">
                        Schedule regular time for physical exercise, spiritual renewal (meditation, prayer, reflection),
                        mental development (reading, learning), and social connection. Create a personal renewal program
                        that addresses all four dimensions. Remember that taking time to sharpen the saw makes all other
                        activities more effective.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="quadrants" className="space-y-4">
              <p className="text-muted-foreground mb-4">
                The Time Management Matrix, also known as the Covey Quadrants, is a powerful tool for organizing tasks
                based on their urgency and importance. This framework helps you prioritize activities to focus on what
                truly matters.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader className="bg-red-50 dark:bg-red-900/20 pb-2">
                    <CardTitle className="text-base">Quadrant I: Urgent & Important</CardTitle>
                    <CardDescription>Do First</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Crises and emergencies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Pressing problems and deadlines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Last-minute preparations</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-muted-foreground">
                      These tasks require immediate attention. While necessary, spending too much time here leads to
                      stress and burnout.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
                    <CardTitle className="text-base">Quadrant II: Not Urgent & Important</CardTitle>
                    <CardDescription>Schedule</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Planning and preparation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Relationship building</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Personal development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Prevention activities</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-muted-foreground">
                      This is the quadrant of effectiveness. Spending more time here reduces time spent in Quadrant I
                      and leads to balanced growth.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-900">
                  <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 pb-2">
                    <CardTitle className="text-base">Quadrant III: Urgent & Not Important</CardTitle>
                    <CardDescription>Delegate</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Interruptions and some calls</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Some meetings and reports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Many "pressing" matters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Many popular activities</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-muted-foreground">
                      These tasks feel important due to their urgency but contribute little to your goals. Delegate
                      these when possible.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
                    <CardTitle className="text-base">Quadrant IV: Not Urgent & Not Important</CardTitle>
                    <CardDescription>Eliminate</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Trivial busy work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Time wasters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Excessive relaxation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Mindless scrolling and entertainment</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-muted-foreground">
                      These activities provide little to no value and should be minimized or eliminated to free up time
                      for more important tasks.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">How to Use the Time Matrix</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-medium">1.</span>
                    <span>Identify which quadrant each of your tasks belongs to</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">2.</span>
                    <span>Focus on reducing time spent in Quadrants III and IV</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">3.</span>
                    <span>Increase time spent in Quadrant II to prevent Quadrant I crises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">4.</span>
                    <span>
                      Schedule time for Quadrant II activities before your calendar fills with less important matters
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">5.</span>
                    <span>Learn to say no to activities that don't align with your priorities</span>
                  </li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="principles" className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Beyond the 7 Habits, Stephen Covey taught several key principles that form the foundation of effective
                personal and interpersonal leadership.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="principle1">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>Principle-Centered Leadership</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Covey advocated for leadership based on universal principles like fairness, integrity, honesty,
                      and human dignity. These principles are not practices or values but rather fundamental truths that
                      have stood the test of time.
                    </p>
                    <p className="mt-2">
                      When we align our lives with these principles, we develop character and create a foundation for
                      lasting effectiveness and trust.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="principle2">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <span>The Abundance Mentality</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      The Abundance Mentality flows from a deep inner sense of personal worth and security. It
                      recognizes that there is plenty out there for everyone, as opposed to the Scarcity Mentality that
                      sees life as a finite pie.
                    </p>
                    <p className="mt-2">
                      With an Abundance Mentality, we can celebrate the success of others rather than feeling threatened
                      by it. This mindset is essential for creating win-win solutions and synergistic relationships.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="principle3">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>The Four Quadrants of Time Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Covey's Time Management Matrix categorizes activities based on urgency and importance. The key
                      insight is that many people spend too much time on urgent matters (Quadrants I and III) and not
                      enough on important but not urgent activities (Quadrant II).
                    </p>
                    <p className="mt-2">
                      Quadrant II activities—like planning, prevention, relationship building, and personal
                      development—are the ones that make the biggest difference in our effectiveness and quality of
                      life.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="principle4">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>The Emotional Bank Account</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      The Emotional Bank Account is a metaphor for the trust that's built in a relationship. Like a
                      financial account, you can make deposits (through kindness, honesty, keeping promises) and
                      withdrawals (through unkindness, disrespect, breaking promises).
                    </p>
                    <p className="mt-2">
                      Maintaining a high balance in your Emotional Bank Accounts with others creates strong, trusting
                      relationships that can weather occasional withdrawals.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="principle5">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span>The Law of the Farm</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      The Law of the Farm teaches that in agriculture, you can't cram or take shortcuts. You prepare the
                      soil, plant the seed, water, weed, and nurture growth—all in the proper season and sequence.
                    </p>
                    <p className="mt-2">
                      Similarly, in life and relationships, success comes from patient, persistent effort over time.
                      Quick fixes and shortcuts don't create lasting results. This principle reminds us that meaningful
                      achievement requires consistent work and natural growth processes.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="principle6">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span>Circle of Influence vs. Circle of Concern</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      Covey distinguished between our Circle of Concern (all the things we care about) and our Circle of
                      Influence (things we can actually do something about).
                    </p>
                    <p className="mt-2">
                      Proactive people focus their energy on their Circle of Influence, which tends to expand as a
                      result. Reactive people focus on their Circle of Concern, which leads to blaming external factors
                      and negative energy that shrinks their Circle of Influence.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

