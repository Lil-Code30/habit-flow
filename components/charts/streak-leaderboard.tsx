"use client"

import { Flame } from "lucide-react"

interface StreakLeaderboardProps {
  streaks: { habit: string; streak: number; month: string }[]
}

export function StreakLeaderboard({ streaks }: StreakLeaderboardProps) {
  if (streaks.length === 0) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">No streaks yet</div>
  }

  return (
    <div className="space-y-3">
      {streaks.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                index === 0
                  ? "bg-yellow-500/20 text-yellow-500"
                  : index === 1
                    ? "bg-gray-400/20 text-gray-400"
                    : index === 2
                      ? "bg-orange-500/20 text-orange-500"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-32">{item.habit}</p>
              <p className="text-xs text-muted-foreground">{item.month}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="font-bold">{item.streak}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
