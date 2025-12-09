"use client"

interface HeatmapCalendarProps {
  data: { date: string; value: number }[]
}

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  if (data.length === 0) {
    return <div className="flex h-32 items-center justify-center text-muted-foreground">No data available</div>
  }

  const getColor = (value: number) => {
    if (value === 0) return "bg-muted"
    if (value < 25) return "bg-sky-500/20"
    if (value < 50) return "bg-sky-500/40"
    if (value < 75) return "bg-sky-500/60"
    return "bg-sky-500"
  }

  // Group data by weeks
  const weeks: { date: string; value: number }[][] = []
  let currentWeek: { date: string; value: number }[] = []

  data.forEach((day, index) => {
    const date = new Date(day.date)
    const dayOfWeek = date.getDay()

    if (index === 0) {
      // Pad the first week
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: "", value: -1 })
      }
    }

    currentWeek.push(day)

    if (dayOfWeek === 6 || index === data.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 pt-6">
          {dayLabels.map((day, i) => (
            <div key={i} className="h-4 text-xs text-muted-foreground flex items-center">
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.length > 0 && weekIndex % 4 === 0 && (
                <div className="text-xs text-muted-foreground h-5 truncate">
                  {new Date(week.find((d) => d.date)?.date || "").toLocaleDateString("en-US", { month: "short" })}
                </div>
              )}
              {week.length > 0 && weekIndex % 4 !== 0 && <div className="h-5" />}
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`h-4 w-4 rounded-sm ${day.value === -1 ? "bg-transparent" : getColor(day.value)}`}
                  title={day.date ? `${day.date}: ${day.value}%` : ""}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-sky-500/20" />
          <div className="h-3 w-3 rounded-sm bg-sky-500/40" />
          <div className="h-3 w-3 rounded-sm bg-sky-500/60" />
          <div className="h-3 w-3 rounded-sm bg-sky-500" />
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  )
}
