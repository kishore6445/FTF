"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Role } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { createBrowserSupabaseClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"


interface RolesContextType {
  roles: Role[]
  loading: boolean
  addRole: (role: Partial<Role>) => Promise<void>
  updateRole: (role: Role) => Promise<void>
  deleteRole: (roleId: string) => Promise<void>
}

const RolesContext = createContext<RolesContextType | undefined>(undefined)

// Default roles to use as fallback when fetch fails
const DEFAULT_ROLES: Role[] = [
  {
    id: "default-1",
    name: "Professional",
    color: "#4f46e5",
    description: "Work-related responsibilities",
    userId: "default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-2",
    name: "Personal",
    color: "#10b981",
    description: "Personal development and goals",
    userId: "default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "Family",
    color: "#f59e0b",
    description: "Family responsibilities and activities",
    userId: "default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function RolesProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const [fetchAttempts, setFetchAttempts] = useState(0)
  const MAX_FETCH_ATTEMPTS = 3
  const client = createServerComponentClient({ cookies })

  useEffect(() => {
    // Only try to fetch roles if we have a user and we're in a browser environment
    if (user && typeof window !== "undefined") {
      // Add a small delay to ensure auth is fully initialized
      const timer = setTimeout(() => {
        fetchRoles()
      }, 500)

      return () => clearTimeout(timer)
    } else {
      // If no user, use default roles and stop loading
      setRoles(DEFAULT_ROLES)
      setLoading(false)
    }
  }, [user])

  const fetchRoles = async () => {
    if (!user) {
      setRoles(DEFAULT_ROLES)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        throw new Error("Not in browser environment")
      }
      client
      // Add a timeout to the fetch operation
      // const fetchPromise = supabase
      //   .from("roles")
      //   .select("*")
      //   .eq("user_id", user.id)
      //   .order("created_at", { ascending: false })

      const fetchPromise = client
      .from("roles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Fetch roles timeout")), 8000)
      })

      // Race the fetch against the timeout
      const { data, error } = (await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          throw new Error("Fetch roles timeout")
        }),
      ])) as any

      if (error) {
        console.error("Error fetching roles:", error)
        throw error
      }

      const transformedRoles: Role[] = (data || []).map((role: any) => ({
        id: role.id,
        name: role.name,
        color: role.color || "#808080",
        description: role.description || "",
        userId: role.user_id,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
      }))

      // If we got no roles from the database, use the default roles
      if (transformedRoles.length === 0) {
        console.log("No roles found in database, using default roles")
        setRoles(DEFAULT_ROLES)
      } else {
        setRoles(transformedRoles)
      }

      // Reset fetch attempts on success
      setFetchAttempts(0)
    } catch (error) {
      console.error("Error in fetchRoles:", error)

      // If we haven't exceeded max attempts, try again
      if (fetchAttempts < MAX_FETCH_ATTEMPTS) {
        setFetchAttempts((prev) => prev + 1)
        console.log(`Retrying fetch roles (attempt ${fetchAttempts + 1}/${MAX_FETCH_ATTEMPTS})`)

        // Wait a bit before retrying
        setTimeout(
          () => {
            fetchRoles()
          },
          1000 * (fetchAttempts + 1),
        ) // Exponential backoff

        return
      }

      // If we've exceeded max attempts, use default roles
      console.log("Using default roles after failed fetch attempts")
      setRoles(DEFAULT_ROLES)
      toast({
        title: "Using default roles",
        description: "We couldn't connect to the database. Using default roles instead.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addRole = async (roleData: Partial<Role>) => {
    if (!user || typeof window === "undefined") {
      toast({
        title: "Cannot add role",
        description: "You must be logged in to add roles.",
        variant: "destructive",
      })
      return
    }

    try {
      const roleId = roleData.id || uuidv4()
      const now = new Date().toISOString()

      const newRole = {
        id: roleId,
        name: roleData.name || "New Role",
        color: roleData.color || "#808080",
        description: roleData.description || "",
        user_id: user.id,
        created_at: now,
        updated_at: now,
      }

      // First update the local state for immediate UI feedback
      const newRoleForState: Role = {
        id: roleId,
        name: roleData.name || "New Role",
        color: roleData.color || "#808080",
        description: roleData.description || "",
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      }

      setRoles((prevRoles) => [newRoleForState, ...prevRoles])

      // Then try to save to the database
      const { error } = await supabase.from("roles").insert(newRole)

      if (error) {
        console.error("Error adding role to database:", error)
        toast({
          title: "Warning",
          description: "Role added locally but couldn't be saved to the database. Changes may be lost on refresh.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Role added",
        description: "Role added successfully",
      })
    } catch (error) {
      console.error("Error in addRole:", error)
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateRole = async (updatedRole: Role) => {
    if (!user || typeof window === "undefined") {
      toast({
        title: "Cannot update role",
        description: "You must be logged in to update roles.",
        variant: "destructive",
      })
      return
    }

    if (!user) return

    try {
      // First update the local state for immediate UI feedback
      setRoles((prevRoles) => prevRoles.map((role) => (role.id === updatedRole.id ? updatedRole : role)))

      // Then try to save to the database
      const { error } = await supabase
        .from("roles")
        .update({
          name: updatedRole.name,
          color: updatedRole.color,
          description: updatedRole.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedRole.id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating role in database:", error)
        toast({
          title: "Warning",
          description: "Role updated locally but couldn't be saved to the database. Changes may be lost on refresh.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Role updated",
        description: "Role has been updated successfully",
      })
    } catch (error) {
      console.error("Error in updateRole:", error)
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteRole = async (roleId: string) => {
    if (!user || typeof window === "undefined") {
      toast({
        title: "Cannot delete role",
        description: "You must be logged in to delete roles.",
        variant: "destructive",
      })
      return
    }

    if (!user) return

    try {
      // First update the local state for immediate UI feedback
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId))

      // Then try to delete from the database
      const { error } = await supabase.from("roles").delete().eq("id", roleId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting role from database:", error)
        toast({
          title: "Warning",
          description: "Role deleted locally but couldn't be removed from the database. It may reappear on refresh.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Role deleted",
        description: "Role deleted successfully",
      })
    } catch (error) {
      console.error("Error in deleteRole:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <RolesContext.Provider
      value={{
        roles,
        loading,
        addRole,
        updateRole,
        deleteRole,
      }}
    >
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  const context = useContext(RolesContext)
  if (context === undefined) {
    throw new Error("useRoles must be used within a RolesProvider")
  }
  return context
}

// Add this alias for backward compatibility
export const useRolesContext = useRoles

