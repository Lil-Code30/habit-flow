"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

interface HabitRadarChartProps {
  data: { habit: string; completion: number }[]
}

export function HabitRadarChart({ data }: HabitRadarChartProps) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="habit" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-background p-2 shadow-sm">
                  <p className="text-sm font-medium text-foreground">{payload[0].payload.habit}</p>
                  <p className="text-sm text-sky-500">{payload[0].value}% avg completion</p>
                </div>
              )
            }
            return null
          }}
        />
        <Radar name="Completion" dataKey="completion" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
