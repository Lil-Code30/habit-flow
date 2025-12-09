"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import type { MonthWithHabits, HabitWithLogs } from "@/lib/types"
import { getDaysInMonth, getDayName, formatDate, getMonthName, getPreviousMonth, getNextMonth } from "@/lib/utils/date"
import { calculateCompletionRate, calculateStreak, calculateDailyProductivity } from "@/lib/utils/stats"
import { ChevronLeft, ChevronRight, Plus, Flame, Copy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AddHabitDialog } from "./add-habit-dialog"
import { EditHabitDialog } from "./edit-habit-dialog"
import useSWR, { mutate } from "swr"

interface HabitSpreadsheetProps {
  month: MonthWithHabits
  userId: string
}

export function HabitSpreadsheet({ month: initialMonth, userId }: HabitSpreadsheetProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Use SWR for real-time updates
  const fetcher = useCallback(async () => {
    const supabase = createClient()
    const { data: habits } = await supabase
      .from("habits")
      .select("*")
      .eq("month_id", initialMonth.id)
      .order("sort_order", { ascending: true })

    const habitIds = habits?.map((h) => h.id) || []
    const { data: logs } = await supabase.from("habit_logs").select("*").in("habit_id", habitIds)

    const habitsWithLogs: HabitWithLogs[] =
      habits?.map((habit) => ({
        ...habit,
        logs: logs?.filter((log) => log.habit_id === habit.id) || [],
      })) || []

    return { ...initialMonth, habits: habitsWithLogs }
  }, [initialMonth])

  const { data: month } = useSWR(`month-${initialMonth.id}`, fetcher, {
    fallbackData: initialMonth,
    revalidateOnFocus: false,
  })

  const daysInMonth = getDaysInMonth(month.year, month.month_number)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handleToggleHabit = async (habitId: string, day: number, currentChecked: boolean) => {
    const supabase = createClient()
    const dateStr = formatDate(month.year, month.month_number, day)

    // Optimistic update
    const updatedMonth = {
      ...month,
      habits: month.habits.map((h) => {
        if (h.id !== habitId) return h
        const existingLog = h.logs.find((l) => l.log_date === dateStr)
        if (existingLog) {
          return {
            ...h,
            logs: h.logs.map((l) => (l.log_date === dateStr ? { ...l, checked: !currentChecked } : l)),
          }
        }
        return {
          ...h,
          logs: [
            ...h.logs,
            { id: "temp", habit_id: habitId, log_date: dateStr, checked: true, created_at: new Date().toISOString() },
          ],
        }
      }),
    }
    mutate(`month-${month.id}`, updatedMonth, false)

    // Check if log exists
    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", habitId)
      .eq("log_date", dateStr)
      .single()

    if (existingLog) {
      await supabase.from("habit_logs").update({ checked: !currentChecked }).eq("id", existingLog.id)
    } else {
      await supabase.from("habit_logs").insert({
        habit_id: habitId,
        log_date: dateStr,
        checked: true,
      })
    }

    mutate(`month-${month.id}`)
  }

  const handleDuplicatePreviousMonth = async () => {
    setIsDuplicating(true)
    const supabase = createClient()
    const { month: prevMonth, year: prevYear } = getPreviousMonth(month.month_number, month.year)

    // Find previous month
    const { data: previousMonth } = await supabase
      .from("months")
      .select("id")
      .eq("user_id", userId)
      .eq("month_number", prevMonth)
      .eq("year", prevYear)
      .single()

    if (previousMonth) {
      // Get habits from previous month
      const { data: prevHabits } = await supabase
        .from("habits")
        .select("name, color, category, sort_order")
        .eq("month_id", previousMonth.id)

      if (prevHabits && prevHabits.length > 0) {
        // Create habits for current month
        const newHabits = prevHabits.map((h) => ({
          user_id: userId,
          month_id: month.id,
          name: h.name,
          color: h.color,
          category: h.category,
          sort_order: h.sort_order,
        }))

        await supabase.from("habits").insert(newHabits)
        mutate(`month-${month.id}`)
      }
    }
    setIsDuplicating(false)
  }

  const handleNavigateMonth = async (direction: "prev" | "next") => {
    const supabase = createClient()
    const { month: targetMonth, year: targetYear } =
      direction === "prev"
        ? getPreviousMonth(month.month_number, month.year)
        : getNextMonth(month.month_number, month.year)

    const { data: existingMonth } = await supabase
      .from("months")
      .select("id")
      .eq("user_id", userId)
      .eq("month_number", targetMonth)
      .eq("year", targetYear)
      .single()

    if (existingMonth) {
      router.push(`/months/${existingMonth.id}`)
    } else {
      // Create new month
      const { data: newMonth } = await supabase
        .from("months")
        .insert({
          user_id: userId,
          month_name: getMonthName(targetMonth),
          month_number: targetMonth,
          year: targetYear,
        })
        .select()
        .single()

      if (newMonth) {
        router.push(`/months/${newMonth.id}`)
      }
    }
  }

  const isLogChecked = (habit: HabitWithLogs, day: number): boolean => {
    const dateStr = formatDate(month.year, month.month_number, day)
    const log = habit.logs.find((l) => l.log_date === dateStr)
    return log?.checked || false
  }

  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => handleNavigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {month.month_name} {month.year}
            </h1>
            <Link href="/months" className="text-sm text-sky-500 hover:underline">
              View all months
            </Link>
          </div>
          <Button variant="outline" size="icon" onClick={() => handleNavigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {month.habits.length === 0 && (
            <Button variant="outline" onClick={handleDuplicatePreviousMonth} disabled={isDuplicating}>
              <Copy className="mr-2 h-4 w-4" />
              {isDuplicating ? "Duplicating..." : "Copy Previous Month"}
            </Button>
          )}
          <Button onClick={() => setAddDialogOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Habit Progress Cards */}
      {month.habits.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {month.habits.map((habit) => {
            const completion = calculateCompletionRate(habit.logs, month.year, month.month_number)
            const { current: streak, longest } = calculateStreak(habit.logs, month.year, month.month_number)

            return (
              <Card
                key={habit.id}
                className="cursor-pointer hover:border-sky-500/50 transition-colors"
                onClick={() => setEditingHabit(habit)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
                      <span className="truncate">{habit.name}</span>
                    </div>
                    <span className="text-sky-500 font-bold">{completion}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={completion} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>{streak} day streak</span>
                    </div>
                    <span>Best: {longest}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Spreadsheet */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left font-medium text-foreground min-w-16">
                    Day
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-foreground min-w-12">Name</th>
                  {month.habits.map((habit) => (
                    <th
                      key={habit.id}
                      className="px-3 py-2 text-center font-medium text-foreground min-w-20 max-w-32 truncate"
                      title={habit.name}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                        <span className="truncate">{habit.name}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-foreground min-w-20">Daily %</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dayName = getDayName(month.year, month.month_number, day)
                  const isWeekend = dayName === "Sat" || dayName === "Sun"
                  const dailyProductivity = calculateDailyProductivity(
                    month.habits,
                    month.year,
                    month.month_number,
                    day,
                  )

                  return (
                    <tr key={day} className={`border-t border-border ${isWeekend ? "bg-muted/30" : ""}`}>
                      <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium text-foreground">{day}</td>
                      <td className="px-3 py-2 text-muted-foreground">{dayName}</td>
                      {month.habits.map((habit) => {
                        const checked = isLogChecked(habit, day)
                        return (
                          <td key={habit.id} className="px-3 py-2 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => handleToggleHabit(habit.id, day, checked)}
                                className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                              />
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            dailyProductivity >= 80
                              ? "bg-green-500/20 text-green-500"
                              : dailyProductivity >= 50
                                ? "bg-yellow-500/20 text-yellow-500"
                                : dailyProductivity > 0
                                  ? "bg-orange-500/20 text-orange-500"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {month.habits.length > 0 ? `${dailyProductivity}%` : "-"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddHabitDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        monthId={month.id}
        userId={userId}
        onSuccess={() => mutate(`month-${month.id}`)}
      />

      {editingHabit && (
        <EditHabitDialog
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          habit={editingHabit}
          onSuccess={() => {
            mutate(`month-${month.id}`)
            setEditingHabit(null)
          }}
        />
      )}
    </div>
  )
}
