-- Migration: add email_hash for deduplication after encrypting email field
-- Run in Supabase SQL Editor

-- 1. Add email_hash column (unique) and make email non-unique
alter table email_subscribers
  add column if not exists email_hash text;

-- 2. Backfill email_hash with sha256 of existing plaintext emails
update email_subscribers
set email_hash = encode(digest(lower(trim(email)), 'sha256'), 'hex')
where email_hash is null;

-- 3. Add unique constraint on email_hash
alter table email_subscribers
  add constraint email_subscribers_email_hash_key unique (email_hash);

-- 4. Drop old unique constraint on email (email will now hold encrypted value)
alter table email_subscribers
  drop constraint if exists email_subscribers_email_key;
