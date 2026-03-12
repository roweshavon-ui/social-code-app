-- Social Code — Supabase Schema

-- Posts (blog)
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text not null,
  content      text not null,
  keywords     text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_published_idx on posts(published, published_at desc);
-- Run this in your Supabase project: SQL Editor > New Query > paste & run

-- Clients
create table if not exists clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text,
  jungian_type  text,
  goal          text,
  status        text not null default 'active' check (status in ('active', 'inactive')),
  notes         text,
  created_at    timestamptz not null default now()
);

-- Coaching sessions
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null,
  date          date not null,
  duration      text not null default '60',
  notes         text,
  action_items  text,
  rating        integer not null default 5 check (rating between 1 and 5),
  created_at    timestamptz not null default now()
);

-- Frameworks, scripts, exercises etc.
create table if not exists library_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null default 'Other',
  content     text,
  tags        text,
  created_at  timestamptz not null default now()
);

-- Landing page email captures
create table if not exists email_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- Public assessment submissions (from the website)
create table if not exists assessments (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  goal         text,
  jungian_type text not null,
  scores       jsonb,
  created_at   timestamptz not null default now()
);
