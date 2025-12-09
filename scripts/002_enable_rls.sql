-- Enable Row Level Security on all tables

ALTER TABLE months ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_stats ENABLE ROW LEVEL SECURITY;

-- MONTHS POLICIES
CREATE POLICY "Users can view their own months" 
    ON months FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own months" 
    ON months FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own months" 
    ON months FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own months" 
    ON months FOR DELETE 
    USING (auth.uid() = user_id);

-- HABITS POLICIES
CREATE POLICY "Users can view their own habits" 
    ON habits FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" 
    ON habits FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
    ON habits FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
    ON habits FOR DELETE 
    USING (auth.uid() = user_id);

-- HABIT LOGS POLICIES (via habit ownership)
CREATE POLICY "Users can view their own habit logs" 
    ON habit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_logs.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own habit logs" 
    ON habit_logs FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_logs.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own habit logs" 
    ON habit_logs FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_logs.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own habit logs" 
    ON habit_logs FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_logs.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

-- HABIT STATS POLICIES (via month ownership)
CREATE POLICY "Users can view their own habit stats" 
    ON habit_stats FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM months 
            WHERE months.id = habit_stats.month_id 
            AND months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own habit stats" 
    ON habit_stats FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM months 
            WHERE months.id = habit_stats.month_id 
            AND months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own habit stats" 
    ON habit_stats FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM months 
            WHERE months.id = habit_stats.month_id 
            AND months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own habit stats" 
    ON habit_stats FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM months 
            WHERE months.id = habit_stats.month_id 
            AND months.user_id = auth.uid()
        )
    );
