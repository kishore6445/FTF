import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const habits = [
  {
    id: "1",
    title: "Be Proactive",
    description:
      "Take initiative in life by realizing your decisions are the primary determining factor for effectiveness in your life.",
  },
  {
    id: "2",
    title: "Begin with the End in Mind",
    description:
      "Self-discover and clarify your deeply important character values and life goals. Envision the ideal characteristics for each of your various roles and relationships in life.",
  },
  {
    id: "3",
    title: "Put First Things First",
    description:
      "Prioritize, plan, and execute your week's tasks based on importance rather than urgency. Evaluate if your efforts exemplify your desired character values, propel you toward goals, and enrich the roles and relationships elaborated in Habit 2.",
  },
  {
    id: "4",
    title: "Think Win-Win",
    description:
      "Genuinely strive for mutually beneficial solutions or agreements in your relationships. Value and respect people by understanding a 'win' for all is ultimately a better long-term resolution than if only one person in the situation had gotten their way.",
  },
  {
    id: "5",
    title: "Seek First to Understand, Then to Be Understood",
    description:
      "Use empathic listening to be genuinely influenced by a person, which compels them to reciprocate the listening and take an open mind to being influenced by you. This creates an atmosphere of caring, and positive problem-solving.",
  },
  {
    id: "6",
    title: "Synergize",
    description:
      "Combine the strengths of people through positive teamwork, so as to achieve goals that no one could have done alone.",
  },
  {
    id: "7",
    title: "Sharpen the Saw",
    description:
      "Balance and renew your resources, energy, and health to create a sustainable, long-term, effective lifestyle. This includes physical, mental, spiritual, and social/emotional aspects.",
  },
]

export default function SevenHabits() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>The 7 Habits</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {habits.map((habit) => (
            <AccordionItem value={habit.id} key={habit.id}>
              <AccordionTrigger>{habit.title}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">{habit.description}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

