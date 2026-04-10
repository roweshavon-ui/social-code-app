-- ============================================================
-- SECURITY FIX: Enable RLS on all tables + add email_hash
-- Run this in Supabase: SQL Editor > New Query > paste > Run
-- ============================================================

-- 1. Enable Row-Level Security on every table
--    (the server uses the service_role key which bypasses RLS,
--     so this won't break anything — it just blocks public access)
alter table posts            enable row level security;
alter table comments         enable row level security;
alter table clients          enable row level security;
alter table sessions         enable row level security;
alter table library_items    enable row level security;
alter table email_subscribers enable row level security;
alter table assessments      enable row level security;

-- group_sessions if it exists
do $$ begin
  alter table group_sessions enable row level security;
exception when undefined_table then null;
end $$;

-- 2. Add email_hash column to email_subscribers for dedup after encryption
alter table email_subscribers
  add column if not exists email_hash text;

-- Backfill hash from existing plaintext emails
update email_subscribers
set email_hash = encode(digest(lower(trim(email)), 'sha256'), 'hex')
where email_hash is null;

-- Add unique constraint on email_hash
alter table email_subscribers
  add constraint email_subscribers_email_hash_key unique (email_hash);

-- Drop old unique constraint on email column
alter table email_subscribers
  drop constraint if exists email_subscribers_email_key;
