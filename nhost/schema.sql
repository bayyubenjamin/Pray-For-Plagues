-- Run in Nhost SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  wallet text not null,
  x_handle text not null,
  x_user_id text,
  points integer not null default 0,
  referred_by text,
  source text not null default 'site',
  collection text not null default 'pray-for-plagues',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_email_key unique (email),
  constraint waitlist_wallet_key unique (wallet),
  constraint waitlist_x_handle_key unique (x_handle)
);

alter table public.waitlist add column if not exists points integer not null default 0;
alter table public.waitlist add column if not exists referred_by text;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  x_handle text not null,
  wallet text,
  email text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_x_handle_key unique (x_handle)
);

alter table public.profiles add column if not exists points integer not null default 0;

alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "waitlist_insert" on public.waitlist;
drop policy if exists "waitlist_select" on public.waitlist;
drop policy if exists "waitlist_update" on public.waitlist;
create policy "waitlist_insert" on public.waitlist for insert with check (true);
create policy "waitlist_select" on public.waitlist for select using (true);
create policy "waitlist_update" on public.waitlist for update using (true);

drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles for all using (true) with check (true);
