"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const COLORS = ["#0EA5E9", "#22C55E", "#EAB308", "#F97316", "#EF4444", "#A855F7"]

interface HabitCompletionChartProps {
  data: Record<string, number | string>[]
  habitNames: string[]
}

export function HabitCompletionChart({ data, habitNames }: HabitCompletionChartProps) {
  if (data.length === 0 || habitNames.length === 0) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-background p-2 shadow-sm">
                  <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                  {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                      {entry.name}: {entry.value}%
                    </p>
                  ))}
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        {habitNames.map((name, index) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
