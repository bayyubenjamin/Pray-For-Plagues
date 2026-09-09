-- Paste into Nhost → Database → SQL Editor
-- Do NOT use roles anon/authenticated here — those are Hasura roles, not Postgres.

create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  wallet text not null,
  x_handle text,
  source text not null default 'opensea',
  collection text not null default 'pray-for-plagues',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_email_key unique (email),
  constraint waitlist_wallet_key unique (wallet)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  email text,
  x_handle text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_wallet_key unique (wallet)
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  task_id text not null,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  unique (wallet, task_id)
);

alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;
alter table public.task_completions enable row level security;

drop policy if exists "anon insert waitlist" on public.waitlist;
drop policy if exists "anon select own waitlist" on public.waitlist;
drop policy if exists "anon upsert profiles" on public.profiles;
drop policy if exists "anon update profiles" on public.profiles;
drop policy if exists "anon select profiles" on public.profiles;
drop policy if exists "anon insert tasks" on public.task_completions;
drop policy if exists "anon select tasks" on public.task_completions;

create policy "waitlist_insert" on public.waitlist
  for insert with check (wallet is not null and email is not null);

create policy "waitlist_select" on public.waitlist
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (wallet is not null);

create policy "profiles_update" on public.profiles
  for update using (true);

create policy "profiles_select" on public.profiles
  for select using (true);

create policy "tasks_insert" on public.task_completions
  for insert with check (true);

create policy "tasks_select" on public.task_completions
  for select using (true);
