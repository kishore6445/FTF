"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

// Collection of Stephen Covey quotes
const coveyQuotes = [
  {
    quote: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    source: "First Things First",
  },
  {
    quote: "Most of us spend too much time on what is urgent and not enough time on what is important.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Begin with the end in mind.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "To live a more balanced existence, you have to recognize that not doing everything that comes along is okay. There's no need to overextend yourself.",
    source: "First Things First",
  },
  {
    quote: "The main thing is to keep the main thing the main thing.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "I am not a product of my circumstances. I am a product of my decisions.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "Trust is the glue of life. It's the most essential ingredient in effective communication. It's the foundational principle that holds all relationships.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Live out of your imagination, not your history.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Seek first to understand, then to be understood.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Strength lies in differences, not in similarities.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "The way we see the problem is the problem.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "We see the world, not as it is, but as we are—or, as we are conditioned to see it.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "Sow a thought, reap an action; sow an action, reap a habit; sow a habit, reap a character; sow a character, reap a destiny.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Effective leadership is putting first things first. Effective management is discipline, carrying it out.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "You have to decide what your highest priorities are and have the courage—pleasantly, smilingly, unapologetically—to say 'no' to other things.",
    source: "First Things First",
  },
  {
    quote:
      "The key is taking responsibility and initiative, deciding what your life is about and prioritizing your life around the most important things.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "When the trust account is high, communication is easy, instant, and effective.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "Synergy is what happens when one plus one equals ten or a hundred or even a thousand! It's the profound result when two or more respectful human beings determine to go beyond their preconceived ideas to meet a great challenge.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Paradigms are powerful because they create the lens through which we see the world.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "Treat a man as he is and he will remain as he is. Treat a man as he can and should be and he will become as he can and should be.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote:
      "Management is efficiency in climbing the ladder of success; leadership determines whether the ladder is leaning against the right wall.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "Two people can see the same thing, disagree, and yet both be right. It's not logical; it's psychological.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "If I really want to improve my situation, I can work on the one thing over which I have control - myself.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "The ability to subordinate an impulse to a value is the essence of the proactive person.",
    source: "The 7 Habits of Highly Effective People",
  },
  {
    quote: "We are not human beings on a spiritual journey. We are spiritual beings on a human journey.",
    source: "The 7 Habits of Highly Effective People",
  },
]

export default function DailyCoveyQuote() {
  const [quote, setQuote] = useState<{ quote: string; source: string } | null>(null)

  useEffect(() => {
    // Use the current date as a seed to select a quote
    // This ensures the same quote is shown all day, but changes each day
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))

    // Use the day of the year to select a quote
    const quoteIndex = dayOfYear % coveyQuotes.length
    setQuote(coveyQuotes[quoteIndex])
  }, [])

  if (!quote) {
    return null
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <Quote className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium italic mb-2">{quote.quote}</p>
            <p className="text-sm text-muted-foreground">
              — Stephen Covey, <span className="italic">{quote.source}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

