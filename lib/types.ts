export interface Task {
  status: TaskStatus
  frequency: TaskFrequency
  isBigRock: boolean
  id: string
  title: string
  description?: string
  quadrant: string
  roleId?: string
  completed: boolean
  timeSpent: number
  subtasks: Subtask[]
  userId: string
  createdAt?: string
  updatedAt?: string
  dueDate?: string
  recurrenceId?: string
  recurrencePattern?: RecurrencePattern
  isRitual?: boolean
  is_big_rock?: boolean
  is_mission_item?: boolean
  ritualDate?: string // Add this field if it doesn't exist and is needed
  priority?: string // Add priority field
  links?: string; // ✅ Add this line
  startDate?: string;
  pomodoroRequired?: number;

}

export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  userId: string
  createdAt?: string
  updatedAt?: string
}

export interface Role {
  id: string
  name: string
  color: string
  description?: string
  userId: string
  createdAt?: string
  updatedAt?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  deadline?: string
  timeframe: string
  userId: string
  createdAt?: string
  updatedAt?: string
}

export interface PersonalStatement {
  id: string
  mission?: string
  vision?: string
  eulogy?: string
  values?: string
  userId: string
  createdAt?: string
  updatedAt?: string
}

export interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  userId: string
  createdAt?: string
  updatedAt?: string
}

export interface MissionItem {
  id: string
  title: string
  completed: boolean
  priority: number
  type: string
  userId: string
  createdAt?: string
  updatedAt?: string
  ritualType?: string
  startTime?: string
  endTime?: string
}

export interface PomodoroSession {
  id: string
  taskId?: string
  taskTitle: string
  startTime: string
  duration: number
  completed: boolean
  userId: string
  createdAt?: string
  updatedAt?: string
}

export interface RecurrencePattern {
  id: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  daysOfWeek?: string[]
  dayOfMonth?: number
  monthOfYear?: number
  startDate: string
  endDate?: string
  count?: number
  userId: string
  createdAt?: string
  updatedAt?: string
}

export type QuadrantType = "q1" | "q2" | "q3" | "q4"

