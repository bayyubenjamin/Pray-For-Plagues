-- ============================================================
-- PRAY FOR PLAGUES — Nhost / Hasura SQL
-- Paste ALL of this into Nhost Dashboard → Database → SQL Editor
-- Then: Hasura → Data → Track tables: waitlist, profiles, task_completions
-- ============================================================

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
  updated_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key on public.waitlist (lower(email));
create unique index if not exists waitlist_wallet_key on public.waitlist (lower(wallet));

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  email text,
  x_handle text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_wallet_key on public.profiles (lower(wallet));

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
create policy "anon insert waitlist"
  on public.waitlist for insert to anon, authenticated
  with check (wallet is not null and email is not null);

drop policy if exists "anon select own waitlist" on public.waitlist;
create policy "anon select own waitlist"
  on public.waitlist for select to anon, authenticated
  using (true);

drop policy if exists "anon upsert profiles" on public.profiles;
create policy "anon upsert profiles"
  on public.profiles for insert to anon, authenticated
  with check (wallet is not null);

drop policy if exists "anon update profiles" on public.profiles;
create policy "anon update profiles"
  on public.profiles for update to anon, authenticated
  using (true);

drop policy if exists "anon select profiles" on public.profiles;
create policy "anon select profiles"
  on public.profiles for select to anon, authenticated
  using (true);

drop policy if exists "anon insert tasks" on public.task_completions;
create policy "anon insert tasks"
  on public.task_completions for insert to anon, authenticated
  with check (true);

drop policy if exists "anon select tasks" on public.task_completions;
create policy "anon select tasks"
  on public.task_completions for select to anon, authenticated
  using (true);

comment on table public.waitlist is 'NFT OpenSea allowlist / waitlist';
