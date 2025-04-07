export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          timeframe: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id: string
          timeframe: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          timeframe?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      meetings: {
        Row: {
          created_at: string | null
          date: string
          description: string
          duration: number
          id: string
          time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          duration: number
          id: string
          time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          duration?: number
          id?: string
          time?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      personal_statements: {
        Row: {
          created_at: string | null
          eulogy: string | null
          id: string
          mission: string | null
          updated_at: string | null
          user_id: string
          values: string | null
          vision: string | null
        }
        Insert: {
          created_at?: string | null
          eulogy?: string | null
          id: string
          mission?: string | null
          updated_at?: string | null
          user_id: string
          values?: string | null
          vision?: string | null
        }
        Update: {
          created_at?: string | null
          eulogy?: string | null
          id?: string
          mission?: string | null
          updated_at?: string | null
          user_id?: string
          values?: string | null
          vision?: string | null
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          task_id: string | null
          task_title: string
          start_time: string
          duration: number
          completed: boolean
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          task_id?: string | null
          task_title: string
          start_time: string
          duration: number
          completed?: boolean
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string | null
          task_title?: string
          start_time?: string
          duration?: number
          completed?: boolean
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      recurrence_patterns: {
        Row: {
          id: string
          frequency: string
          interval: number
          days_of_week: string[] | null
          day_of_month: number | null
          month_of_year: number | null
          start_date: string
          end_date: string | null
          count: number | null
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          frequency: string
          interval: number
          days_of_week?: string[] | null
          day_of_month?: number | null
          month_of_year?: number | null
          start_date: string
          end_date?: string | null
          count?: number | null
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          frequency?: string
          interval?: number
          days_of_week?: string[] | null
          day_of_month?: number | null
          month_of_year?: number | null
          start_date?: string
          end_date?: string | null
          count?: number | null
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      roles: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          id: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      subtasks: {
        Row: {
          completed: boolean
          created_at: string | null
          id: string
          task_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed: boolean
          created_at?: string | null
          id: string
          task_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          id?: string
          task_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      tasks: {
        Row: {
          completed: boolean
          created_at: string | null
          description: string | null
          id: string
          quadrant: string
          role_id: string | null
          time_spent: number
          title: string
          updated_at: string | null
          user_id: string
          due_date: string | null
          recurrence_id: string | null
        }
        Insert: {
          completed: boolean
          created_at?: string | null
          description?: string | null
          id: string
          quadrant: string
          role_id: string | null
          time_spent: number
          title: string
          updated_at?: string | null
          user_id: string
          due_date?: string | null
          recurrence_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          quadrant?: string
          role_id?: string | null
          time_spent?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          due_date?: string | null
          recurrence_id?: string | null
        }
      }
      mission_items: {
        Row: {
          id: string
          title: string
          completed: boolean
          priority: number
          type: string
          user_id: string
          created_at: string | null
          updated_at: string | null
          ritual_type: string | null
          start_time: string | null
          end_time: string | null
        }
        Insert: {
          id: string
          title: string
          completed: boolean
          priority: number
          type: string
          user_id: string
          created_at?: string | null
          updated_at?: string | null
          ritual_type?: string | null
          start_time?: string | null
          end_time?: string | null
        }
        Update: {
          id?: string
          title?: string
          completed?: boolean
          priority?: string
          type?: string
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
          ritual_type?: string | null
          start_time?: string | null
          end_time?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: any
    }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"]
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: any
      }
      ? Database["public"]["Tables"] & Database["public"]["Views"]
      : never
    : never

export type Table<TableName extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])> =
  (Database["public"]["Tables"] & Database["public"]["Views"])[TableName] extends {
    Row: any
  }
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[TableName]["Row"]
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

