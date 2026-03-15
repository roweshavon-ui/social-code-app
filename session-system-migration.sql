-- Session System Migration
-- Run this in your Supabase SQL Editor

-- 1. Add structured fields to sessions table
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS session_number integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS session_type text DEFAULT 'ongoing',
  ADD COLUMN IF NOT EXISTS client_engagement text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS homework_completion text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS homework_assigned text,
  ADD COLUMN IF NOT EXISTS breakthrough_moment text,
  ADD COLUMN IF NOT EXISTS coach_observations text,
  ADD COLUMN IF NOT EXISTS frameworks_used text[];

-- 2. Add profile tracking fields to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS progress_status text DEFAULT 'early',
  ADD COLUMN IF NOT EXISTS contradiction_log jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS profile_updated_session integer;

-- 3. Create group_sessions table
CREATE TABLE IF NOT EXISTS group_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number integer DEFAULT 1,
  title text,
  session_date date,
  duration text DEFAULT '60',
  client_ids uuid[],
  framework text,
  custom_topic text,
  session_plan jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);
