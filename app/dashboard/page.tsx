import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { DashboardContent } from "@/components/dashboard-content"
import type { Month, Habit, HabitLog, HabitWithLogs, MonthWithHabits } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch all months with habits and logs
  const { data: months } = await supabase
    .from("months")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("year", { ascending: true })
    .order("month_number", { ascending: true })

  // Fetch all habits for all months
  const monthIds = months?.map((m: Month) => m.id) || []
  const { data: habits } = await supabase.from("habits").select("*").in("month_id", monthIds)

  // Fetch all logs
  const habitIds = habits?.map((h: Habit) => h.id) || []
  const { data: logs } = await supabase.from("habit_logs").select("*").in("habit_id", habitIds)

  // Combine data
  const monthsWithHabits: MonthWithHabits[] =
    months?.map((month: Month) => {
      const monthHabits = habits?.filter((h: Habit) => h.month_id === month.id) || []
      const habitsWithLogs: HabitWithLogs[] = monthHabits.map((habit: Habit) => ({
        ...habit,
        logs: logs?.filter((l: HabitLog) => l.habit_id === habit.id) || [],
      }))
      return { ...month, habits: habitsWithLogs }
    }) || []

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userEmail={userData.user.email} />
      <main className="container mx-auto px-4 py-8">
        <DashboardContent months={monthsWithHabits} />
      </main>
    </div>
  )
}
