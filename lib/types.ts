export interface Month {
  id: string
  user_id: string
  month_name: string
  month_number: number
  year: number
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  month_id: string
  name: string
  color: string
  category: string
  sort_order: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  log_date: string
  checked: boolean
  created_at: string
}

export interface HabitStats {
  id: string
  month_id: string
  habit_id: string
  completion_rate: number
  streak: number
  longest_streak: number
  updated_at: string
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  stats?: HabitStats
}

export interface MonthWithHabits extends Month {
  habits: HabitWithLogs[]
}

export type HabitCategory = "health" | "learning" | "finance" | "personal" | "work" | "general"

export const HABIT_CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "learning", label: "Learning" },
  { value: "finance", label: "Finance" },
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "general", label: "General" },
]

export const HABIT_COLORS = [
  "#0EA5E9", // Sky
  "#22C55E", // Green
  "#EAB308", // Yellow
  "#F97316", // Orange
  "#EF4444", // Red
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
]
