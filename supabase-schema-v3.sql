-- Migration: add observations and social_patterns columns to clients
alter table clients
  add column if not exists observations text default '',
  add column if not exists social_patterns text default '';
