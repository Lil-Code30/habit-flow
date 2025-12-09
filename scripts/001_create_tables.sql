-- HabitFlow Database Schema
-- Tables for months, habits, habit_logs, and optional cached stats

-- MONTHS TABLE
CREATE TABLE IF NOT EXISTS months (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_name TEXT NOT NULL,
    month_number INT NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, month_number, year)
);

-- HABITS TABLE
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#0EA5E9',
    category TEXT DEFAULT 'general',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABIT LOGS TABLE (daily checkboxes)
CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (habit_id, log_date)
);

-- HABIT STATS TABLE (cached statistics for performance)
CREATE TABLE IF NOT EXISTS habit_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completion_rate NUMERIC DEFAULT 0,
    streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (month_id, habit_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_months_user_id ON months(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_month_id ON habits(month_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_habit_stats_month_id ON habit_stats(month_id);
