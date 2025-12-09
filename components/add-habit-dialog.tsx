"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HABIT_CATEGORIES, HABIT_COLORS } from "@/lib/types"

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthId: string
  userId: string
  onSuccess: () => void
}

export function AddHabitDialog({ open, onOpenChange, monthId, userId, onSuccess }: AddHabitDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [category, setCategory] = useState("general")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return

    setIsCreating(true)
    const supabase = createClient()

    // Get current max sort order
    const { data: habits } = await supabase
      .from("habits")
      .select("sort_order")
      .eq("month_id", monthId)
      .order("sort_order", { ascending: false })
      .limit(1)

    const maxSortOrder = habits?.[0]?.sort_order ?? -1

    await supabase.from("habits").insert({
      user_id: userId,
      month_id: monthId,
      name: name.trim(),
      color,
      category,
      sort_order: maxSortOrder + 1,
    })

    setName("")
    setColor(HABIT_COLORS[0])
    setCategory("general")
    setIsCreating(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>Create a new habit to track this month.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Read 30 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-offset-background ring-sky-500" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            {isCreating ? "Creating..." : "Create Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
