create table if not exists public.giveaway_entries (
  id text primary key,
  "eventId" text not null,
  "walletAddress" text not null,
  "deviceIdentifier" text not null,
  "joinedAt" timestamptz not null default now(),
  unique ("eventId", "walletAddress")
);
alter table public.giveaway_entries enable row level security;
create policy "giveaway entries readable" on public.giveaway_entries for select using (true);
create policy "giveaway entries insertable" on public.giveaway_entries for insert with check (true);
create policy "giveaway entries updateable" on public.giveaway_entries for update using (true) with check (true);
