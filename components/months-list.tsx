"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Month } from "@/lib/types"
import { getMonthName, getCurrentMonthYear } from "@/lib/utils/date"
import { Calendar, Plus, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface MonthsListProps {
  months: Month[]
  userId: string
}

export function MonthsList({ months, userId }: MonthsListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { year: currentYear } = getCurrentMonthYear()
  const [selectedMonth, setSelectedMonth] = useState<string>("1")
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear))

  const handleCreateMonth = async () => {
    setIsCreating(true)
    const supabase = createClient()

    const monthNum = Number.parseInt(selectedMonth)
    const yearNum = Number.parseInt(selectedYear)

    // Check if month already exists
    const exists = months.some((m) => m.month_number === monthNum && m.year === yearNum)
    if (exists) {
      setIsCreating(false)
      setDialogOpen(false)
      return
    }

    const { data, error } = await supabase
      .from("months")
      .insert({
        user_id: userId,
        month_name: getMonthName(monthNum),
        month_number: monthNum,
        year: yearNum,
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/months/${data.id}`)
    }
    setIsCreating(false)
    setDialogOpen(false)
  }

  const groupedMonths = months.reduce(
    (acc, month) => {
      const year = month.year
      if (!acc[year]) acc[year] = []
      acc[year].push(month)
      return acc
    },
    {} as Record<number, Month[]>,
  )

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getMonthName(i + 1),
  }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Months</h1>
          <p className="text-muted-foreground mt-1">Track your habits month by month</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Month
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Month</DialogTitle>
              <DialogDescription>Select a month and year to start tracking habits.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMonth}
                disabled={isCreating}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                {isCreating ? "Creating..." : "Create Month"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedMonths).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No months yet. Create your first month to start tracking!
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedMonths)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, yearMonths]) => (
            <div key={year} className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{year}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {yearMonths
                  .sort((a, b) => b.month_number - a.month_number)
                  .map((month) => (
                    <Link key={month.id} href={`/months/${month.id}`}>
                      <Card className="hover:border-sky-500/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between">
                            <span>{month.month_name}</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </CardTitle>
                          <CardDescription>{month.year}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>View habits</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          ))
      )}
    </div>
  )
}
