import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { MonthsList } from "@/components/months-list"
import { getCurrentMonthYear, getMonthName } from "@/lib/utils/date"
import type { Month } from "@/lib/types"

export default async function MonthsPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch all months for the user
  const { data: months } = await supabase
    .from("months")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("year", { ascending: false })
    .order("month_number", { ascending: false })

  // Create current month if it doesn't exist
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const currentMonthExists = months?.some((m: Month) => m.month_number === currentMonth && m.year === currentYear)

  if (!currentMonthExists) {
    const { data: newMonth } = await supabase
      .from("months")
      .insert({
        user_id: userData.user.id,
        month_name: getMonthName(currentMonth),
        month_number: currentMonth,
        year: currentYear,
      })
      .select()
      .single()

    if (newMonth) {
      redirect(`/months/${newMonth.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userEmail={userData.user.email} />
      <main className="container mx-auto px-4 py-8">
        <MonthsList months={(months as Month[]) || []} userId={userData.user.id} />
      </main>
    </div>
  )
}
