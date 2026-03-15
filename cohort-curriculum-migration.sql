-- Add curriculum column to cohort_sessions
-- Stores pre-built teaching detail: teach_points, activity, homework, discussion_questions
ALTER TABLE cohort_sessions ADD COLUMN IF NOT EXISTS curriculum jsonb;
