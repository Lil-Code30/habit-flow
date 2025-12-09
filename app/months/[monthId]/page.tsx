import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { HabitSpreadsheet } from "@/components/habit-spreadsheet"
import type { Habit, HabitLog, HabitWithLogs, MonthWithHabits } from "@/lib/types"

export default async function MonthPage({ params }: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch month with habits and logs
  const { data: month, error: monthError } = await supabase
    .from("months")
    .select("*")
    .eq("id", monthId)
    .eq("user_id", userData.user.id)
    .single()

  if (monthError || !month) {
    notFound()
  }

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("month_id", monthId)
    .order("sort_order", { ascending: true })

  // Fetch logs for all habits
  const habitIds = habits?.map((h: Habit) => h.id) || []
  const { data: logs } = await supabase.from("habit_logs").select("*").in("habit_id", habitIds)

  // Combine habits with their logs
  const habitsWithLogs: HabitWithLogs[] =
    habits?.map((habit: Habit) => ({
      ...habit,
      logs: logs?.filter((log: HabitLog) => log.habit_id === habit.id) || [],
    })) || []

  const monthWithHabits: MonthWithHabits = {
    ...month,
    habits: habitsWithLogs,
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userEmail={userData.user.email} />
      <main className="container mx-auto px-4 py-8">
        <HabitSpreadsheet month={monthWithHabits} userId={userData.user.id} />
      </main>
    </div>
  )
}
