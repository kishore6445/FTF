"use client"
export const dynamic = "force-dynamic";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">FirstThings.app</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/franklin-planner" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Franklin Planner
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm mb-6">
              Inspired by Stephen Covey&apos;s Quadrant 2 Philosophy™
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Take Control of Your Time with What Truly Matters
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Stop juggling endless to-do lists. Our Covey Quadrant system helps you prioritize what&apos;s important,
              not just what&apos;s urgent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button size="lg" className="w-full" asChild>
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Focus on high-impact tasks that drive results</h3>
              </div>
              <p className="text-muted-foreground">
                Identify and prioritize tasks that contribute most to your long-term goals and success.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Eliminate distractions and low-value activities</h3>
              </div>
              <p className="text-muted-foreground">
                Recognize and reduce time spent on tasks that don&apos;t contribute to your important goals.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Achieve long-term success with strategic planning</h3>
              </div>
              <p className="text-muted-foreground">
                Balance urgent demands with important activities that prevent crises and create opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="text-center mb-8">
            <div className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm mb-4">
              Special Offer
            </div>
            <h2 className="text-3xl font-bold mb-4">Get a Custom-Built Solution for Just $19.99</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;ll create a personalized version of the Covey Task Manager tailored to your specific needs and
              requirements. Tell us what features you want, and we&apos;ll build a custom solution that works for you.
            </p>
          </div>
          <div className="flex justify-center">
            <Button size="lg" className="font-medium">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">FirstThings.app</span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              &copy; 2023 FirstThings.app. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

