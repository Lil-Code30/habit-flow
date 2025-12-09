import type { HabitLog, HabitWithLogs } from "@/lib/types"
import { getDaysInMonth, formatDate } from "./date"

export function calculateCompletionRate(logs: HabitLog[], year: number, month: number, upToDay?: number): number {
  const daysInMonth = getDaysInMonth(year, month)
  const maxDay = upToDay || daysInMonth

  let checkedDays = 0
  for (let day = 1; day <= maxDay; day++) {
    const dateStr = formatDate(year, month, day)
    const log = logs.find((l) => l.log_date === dateStr)
    if (log?.checked) {
      checkedDays++
    }
  }

  return Math.round((checkedDays / maxDay) * 100)
}

export function calculateStreak(logs: HabitLog[], year: number, month: number): { current: number; longest: number } {
  const daysInMonth = getDaysInMonth(year, month)
  const today = new Date()
  const currentDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : daysInMonth

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Calculate streaks
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day)
    const log = logs.find((l) => l.log_date === dateStr)

    if (log?.checked) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Calculate current streak (from today backwards)
  for (let day = currentDay; day >= 1; day--) {
    const dateStr = formatDate(year, month, day)
    const log = logs.find((l) => l.log_date === dateStr)

    if (log?.checked) {
      currentStreak++
    } else {
      break
    }
  }

  return { current: currentStreak, longest: longestStreak }
}

export function calculateDailyProductivity(habits: HabitWithLogs[], year: number, month: number, day: number): number {
  if (habits.length === 0) return 0

  const dateStr = formatDate(year, month, day)
  let checked = 0

  for (const habit of habits) {
    const log = habit.logs.find((l) => l.log_date === dateStr)
    if (log?.checked) {
      checked++
    }
  }

  return Math.round((checked / habits.length) * 100)
}

export function calculateMonthlyProductivity(habits: HabitWithLogs[], year: number, month: number): number {
  if (habits.length === 0) return 0

  const daysInMonth = getDaysInMonth(year, month)
  const today = new Date()
  const maxDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : daysInMonth

  let totalChecked = 0
  const totalPossible = habits.length * maxDay

  for (const habit of habits) {
    for (const log of habit.logs) {
      const logDate = new Date(log.log_date)
      if (logDate.getDate() <= maxDay && log.checked) {
        totalChecked++
      }
    }
  }

  return totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 0
}
