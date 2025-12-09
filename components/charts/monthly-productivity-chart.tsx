"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface MonthlyProductivityChartProps {
  data: { month: string; productivity: number }[]
}

export function MonthlyProductivityChart({ data }: MonthlyProductivityChartProps) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
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
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-background p-2 shadow-sm">
                  <p className="text-sm font-medium text-foreground">{payload[0].payload.month}</p>
                  <p className="text-sm text-sky-500">{payload[0].value}% productivity</p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="productivity" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
