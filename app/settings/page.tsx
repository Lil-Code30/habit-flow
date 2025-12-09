import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { SettingsContent } from "@/components/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch user's habit statistics
  const { data: months } = await supabase.from("months").select("id").eq("user_id", userData.user.id)

  const monthIds = months?.map((m) => m.id) || []
  const { data: habits } = await supabase.from("habits").select("id").in("month_id", monthIds)

  const habitIds = habits?.map((h) => h.id) || []
  const { data: logs } = await supabase.from("habit_logs").select("id").in("habit_id", habitIds)

  const stats = {
    totalMonths: months?.length || 0,
    totalHabits: habits?.length || 0,
    totalLogs: logs?.length || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userEmail={userData.user.email} />
      <main className="container mx-auto px-4 py-8">
        <SettingsContent user={userData.user} stats={stats} />
      </main>
    </div>
  )
}
