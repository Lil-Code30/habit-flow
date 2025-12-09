"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthWithHabits } from "@/lib/types"
import { getDaysInMonth, formatDate, getMonthName } from "@/lib/utils/date"
import { calculateCompletionRate, calculateStreak, calculateMonthlyProductivity } from "@/lib/utils/stats"
import { BarChart3, TrendingUp, Flame, Trophy, Target, Calendar } from "lucide-react"
import { MonthlyProductivityChart } from "./charts/monthly-productivity-chart"
import { HabitCompletionChart } from "./charts/habit-completion-chart"
import { HabitRadarChart } from "./charts/habit-radar-chart"
import { CategoryPieChart } from "./charts/category-pie-chart"
import { HeatmapCalendar } from "./charts/heatmap-calendar"
import { StreakLeaderboard } from "./charts/streak-leaderboard"

interface DashboardContentProps {
  months: MonthWithHabits[]
}

export function DashboardContent({ months }: DashboardContentProps) {
  // Calculate overall stats
  const totalHabits = months.reduce((acc, m) => acc + m.habits.length, 0)
  const allHabits = months.flatMap((m) => m.habits)

  // Calculate overall productivity
  const monthlyProductivities = months.map((m) => calculateMonthlyProductivity(m.habits, m.year, m.month_number))
  const averageProductivity =
    monthlyProductivities.length > 0
      ? Math.round(monthlyProductivities.reduce((a, b) => a + b, 0) / monthlyProductivities.length)
      : 0

  // Find best streak across all habits
  let bestStreak = 0
  let bestStreakHabit = ""
  for (const month of months) {
    for (const habit of month.habits) {
      const { longest } = calculateStreak(habit.logs, month.year, month.month_number)
      if (longest > bestStreak) {
        bestStreak = longest
        bestStreakHabit = habit.name
      }
    }
  }

  // Calculate current active streaks
  const currentMonth = months[months.length - 1]
  let totalCurrentStreaks = 0
  if (currentMonth) {
    for (const habit of currentMonth.habits) {
      const { current } = calculateStreak(habit.logs, currentMonth.year, currentMonth.month_number)
      totalCurrentStreaks += current
    }
  }

  // Get unique habit names for trend tracking
  const habitNames = [...new Set(allHabits.map((h) => h.name))]

  // Prepare data for charts
  const monthlyData = months.map((m) => ({
    month: `${getMonthName(m.month_number).slice(0, 3)} ${m.year}`,
    productivity: calculateMonthlyProductivity(m.habits, m.year, m.month_number),
    monthNumber: m.month_number,
    year: m.year,
  }))

  // Habit completion trend data
  const habitTrendData = months.map((m) => {
    const data: Record<string, number | string> = {
      month: `${getMonthName(m.month_number).slice(0, 3)}`,
    }
    for (const habit of m.habits) {
      data[habit.name] = calculateCompletionRate(habit.logs, m.year, m.month_number)
    }
    return data
  })

  // Radar chart data - average completion per habit across all months
  const habitAverages = habitNames.map((name) => {
    const habitInstances = allHabits.filter((h) => h.name === name)
    const completions = habitInstances.map((h) => {
      const month = months.find((m) => m.id === h.month_id)
      if (!month) return 0
      return calculateCompletionRate(h.logs, month.year, month.month_number)
    })
    return {
      habit: name,
      completion: completions.length > 0 ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length) : 0,
    }
  })

  // Category data
  const categoryData = allHabits.reduce(
    (acc, habit) => {
      const month = months.find((m) => m.id === habit.month_id)
      if (!month) return acc

      const category = habit.category || "general"
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 }
      }

      const daysInMonth = getDaysInMonth(month.year, month.month_number)
      acc[category].total += daysInMonth
      acc[category].completed += habit.logs.filter((l) => l.checked).length

      return acc
    },
    {} as Record<string, { total: number; completed: number }>,
  )

  const categoryChartData = Object.entries(categoryData).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    value: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }))

  // Heatmap data - daily productivity for the last 3 months
  const heatmapData: { date: string; value: number }[] = []
  const recentMonths = months.slice(-3)
  for (const month of recentMonths) {
    const daysInMonth = getDaysInMonth(month.year, month.month_number)
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(month.year, month.month_number, day)
      let checked = 0
      for (const habit of month.habits) {
        const log = habit.logs.find((l) => l.log_date === dateStr)
        if (log?.checked) checked++
      }
      const productivity = month.habits.length > 0 ? Math.round((checked / month.habits.length) * 100) : 0
      heatmapData.push({ date: dateStr, value: productivity })
    }
  }

  // Streak leaderboard
  const streakData: { habit: string; streak: number; month: string }[] = []
  for (const month of months) {
    for (const habit of month.habits) {
      const { longest } = calculateStreak(habit.logs, month.year, month.month_number)
      if (longest > 0) {
        streakData.push({
          habit: habit.name,
          streak: longest,
          month: `${getMonthName(month.month_number)} ${month.year}`,
        })
      }
    }
  }
  const topStreaks = streakData.sort((a, b) => b.streak - a.streak).slice(0, 5)

  if (months.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your habit analytics and insights</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No data yet. Start tracking habits to see your analytics!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your habit analytics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Productivity</CardTitle>
            <Target className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{averageProductivity}%</div>
            <p className="text-xs text-muted-foreground">across all months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Habits Tracked</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalHabits}</div>
            <p className="text-xs text-muted-foreground">across {months.length} months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Streak</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{bestStreak} days</div>
            <p className="text-xs text-muted-foreground truncate">{bestStreakHabit || "No streaks yet"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streaks</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCurrentStreaks}</div>
            <p className="text-xs text-muted-foreground">total days this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-500" />
              Monthly Productivity
            </CardTitle>
            <CardDescription>Your productivity percentage by month</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyProductivityChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Habit Completion Trend
            </CardTitle>
            <CardDescription>Track how each habit performs over time</CardDescription>
          </CardHeader>
          <CardContent>
            <HabitCompletionChart data={habitTrendData} habitNames={habitNames.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-500" />
              Habit Consistency
            </CardTitle>
            <CardDescription>Average completion per habit</CardDescription>
          </CardHeader>
          <CardContent>
            <HabitRadarChart data={habitAverages.slice(0, 6)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak Leaderboard
            </CardTitle>
            <CardDescription>Your longest streaks</CardDescription>
          </CardHeader>
          <CardContent>
            <StreakLeaderboard streaks={topStreaks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Category Breakdown
            </CardTitle>
            <CardDescription>Productivity by habit category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-500" />
            Daily Activity Heatmap
          </CardTitle>
          <CardDescription>Your daily productivity over the last 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapCalendar data={heatmapData} />
        </CardContent>
      </Card>
    </div>
  )
}
