-- Run this in Supabase SQL Editor after the original schema

-- Add file URL to library items
alter table library_items add column if not exists file_url text;

-- Track which resource a subscriber requested
alter table email_subscribers add column if not exists resource_requested text;

-- Storage bucket for framework PDFs
-- NOTE: Also go to Supabase dashboard → Storage → New bucket
--   Name: resources
--   Public: YES (toggle on)
-- Then add this policy so anyone can read files:
insert into storage.buckets (id, name, public) values ('resources', 'resources', true)
  on conflict (id) do nothing;
