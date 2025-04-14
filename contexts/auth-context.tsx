"use client"
export const dynamic = "force-dynamic";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email?: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  signOut: async () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (!error && data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
          })
          console.log("Session found for user:", data.session.user.email)
        } else if (error) {
          console.error("Session check error:", error)
          setUser(null)
        } else {
          console.log("No session found")
          setUser(null)
        }
      } catch (error) {
        console.error("Exception in checkSession:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
        })
      } else {
        setUser(null)
        // Only redirect to login on sign out event
        if (event === "SIGNED_OUT") {
          router.push("/login")
        }
      }
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      })
      // Still sign out locally even if there's an API error
      setUser(null)
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, setUser, signOut, loading }}>{children}</AuthContext.Provider>
}

