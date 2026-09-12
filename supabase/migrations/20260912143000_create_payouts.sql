create table if not exists public.payouts (
  id text primary key,
  "claimId" text not null,
  "eventId" text not null,
  "taskId" text not null,
  "recipientAddress" text not null,
  "amountLuna" bigint not null check ("amountLuna" > 0),
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'confirmed', 'failed')),
  "txHash" text,
  "failureMessage" text,
  "submittedAt" timestamptz,
  "confirmedAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create unique index if not exists payouts_claim_id_key
  on public.payouts ("claimId");

create index if not exists payouts_event_status_idx
  on public.payouts ("eventId", status);

alter table public.payouts enable row level security;

-- The Mini App uses Nimiq Pay/device identity rather than Supabase Auth.
-- Tighten these policies when a server-side payout worker is introduced.
create policy "Mini App can read payouts"
  on public.payouts for select
  using (true);

create policy "Mini App can create payouts"
  on public.payouts for insert
  with check (true);

create policy "Mini App can update payouts"
  on public.payouts for update
  using (true)
  with check (true);
