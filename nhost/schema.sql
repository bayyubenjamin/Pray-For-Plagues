-- Run this in Nhost Hasura SQL / migrations.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  wallet text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  wallet text unique not null,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;

create policy "public insert waitlist"
  on public.waitlist for insert
  with check (true);

create policy "owner read profile"
  on public.profiles for select
  using (true);

create policy "owner upsert profile"
  on public.profiles for insert
  with check (true);

create policy "owner update profile"
  on public.profiles for update
  using (true);
