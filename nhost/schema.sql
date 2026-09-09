-- Run in Nhost SQL Editor. Unique: 1 X, 1 wallet, 1 email.

create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  wallet text not null,
  x_handle text not null,
  x_user_id text,
  source text not null default 'site',
  collection text not null default 'pray-for-plagues',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_email_key unique (email),
  constraint waitlist_wallet_key unique (wallet),
  constraint waitlist_x_handle_key unique (x_handle)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet text,
  email text,
  x_handle text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  wallet text,
  x_handle text,
  task_id text not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;
alter table public.task_completions enable row level security;

drop policy if exists "waitlist_insert" on public.waitlist;
drop policy if exists "waitlist_select" on public.waitlist;
create policy "waitlist_insert" on public.waitlist for insert with check (true);
create policy "waitlist_select" on public.waitlist for select using (true);
