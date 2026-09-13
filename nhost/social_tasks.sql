alter table public.waitlist add column if not exists social_tasks text[] not null default '{}';
