# EventQuest

EventQuest is a Nimiq Pay Mini App for live events. Hosts create quiz or giveaway stages, share a link or QR code, and manage wallet rewards from Creator Hub. Attendees join with a Nimiq wallet and receive NIM when the host sends a reward.

## Product model

- **Quiz:** attendees answer live questions. Correct answers create reward claims up to the configured winner slots and budget.
- **Giveaway:** attendees submit a connected wallet address. Every eligible submission receives the fixed NIM amount configured by the host; there is no winner selection or trivia.
- **Starred discovery:** the home screen only shows stages the attendee has starred. An unstarred stage can still be opened through its event link, slug, or QR flow.
- **Creator identity:** the creator name is saved once in Settings and reused for newly created stages.
- **Wallet boundary:** Nimiq Pay owns wallet identity and transaction approval. EventQuest does not hold a creator private key or attendee funds.

## Payout semantics (important)

Creator Hub has a payout **queue**, not an atomic blockchain batch transaction.

When the host starts the queue, EventQuest:

1. Loads pending and retryable failed payout records.
2. Requests one `sendBasicTransactionWithData` transaction from Nimiq Pay for each recipient, sequentially.
3. Records the returned provider identifier as `submitted`.
4. Marks an individual payout `failed` if that request errors, then continues with the remaining queue.
5. Allows pending or failed records to be retried without intentionally resending submitted records.

For 100 recipients, this means up to 100 separate transaction requests and potentially 100 wallet approval prompts. The current `@nimiq/mini-app-sdk` has no multi-recipient or `sendBatch` method, so the app must not claim one-click approval or atomic batch settlement.

The SDK result is treated as a submitted transaction identifier. It is **not independently confirmed on-chain** yet. The app does not currently verify inclusion, sender, recipient, amount, or confirmations through an indexer/RPC reconciliation worker. A `submitted` payout therefore means that Nimiq Pay returned a provider result, not that final blockchain confirmation has been proven.

## QR and camera behavior

EventQuest generates QR codes for hosts to display and provides manual event-link/slug entry. It does not request camera permission and does not contain a QR decoder. Attendees must open the Nimiq Pay scanner (or their device camera) and then open the resulting EventQuest link, or paste the link directly into the app.

The installed Mini App SDK exposes wallet and transaction methods but no camera or QR-scanning bridge. Adding an in-app scanner would require a browser camera implementation, HTTPS/localhost, a QR decoder dependency, permission/error handling, and a UX decision about whether scanning should happen inside EventQuest or remain delegated to Nimiq Pay. It is intentionally not part of the current trust boundary.

## Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Lucide icons.
- **Wallet:** `@nimiq/mini-app-sdk`; `src/lib/nimiq.ts` initializes the injected Nimiq Pay provider and sends individual NIM transactions.
- **Persistence:** Supabase when configured, with localStorage fallback for local development.
- **QR generation:** `qrcode.react`.
- **Main surfaces:** Home, Rewards, Wallet & Settings, Creator Hub, event creation, attendee quiz flow, and giveaway submission flow.

Important source files:

| Area | File |
| --- | --- |
| Application state and navigation | `src/App.tsx` |
| Creator workflow, submissions, and payout queue | `src/components/CreatorUtilityModal.tsx` |
| Attendee quiz/giveaway flow | `src/components/LiveSessionsSection.tsx` |
| Starred stage discovery and join links | `src/components/StageQrPortal.tsx` |
| Nimiq provider and transaction request | `src/lib/nimiq.ts` |
| Supabase/local persistence | `src/lib/db.ts` |
| Domain types | `src/lib/types.ts` |
| Hosted payout schema | `supabase/migrations/20260912143000_create_payouts.sql` |
| Hosted giveaway schema | `supabase/migrations/20260912150000_create_giveaway_entries.sql` |

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. The app can run in a normal browser for UI testing. Wallet connection and payout approval require the app to be opened inside Nimiq Pay with its injected provider.

Available scripts:

```bash
npm run build   # Type-check and production build
npm run lint    # Oxlint
npm run preview # Serve the production build locally
```

## Supabase configuration

Set the Vite variables in `.env.local` when hosted persistence is needed:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Apply the migrations in `supabase/migrations/` before testing hosted payouts or giveaway entries. Without Supabase configuration, the app uses localStorage for development data.

If Creator Hub reports `public.payouts` missing from the schema cache, the payout migration has not reached that Supabase project. Open the Supabase SQL Editor, run `supabase/migrations/20260912143000_create_payouts.sql`, then reload EventQuest. The migration includes a PostgREST schema-cache reload notification.

## Local data

The local fallback stores creator settings, starred events, guide state, claims, payout records, giveaway entries, and the device identifier in browser storage. Relevant keys include:

- `eventquest_creator_name`
- `eventquest_starred_events`
- `eventquest_guide_seen`
- `eventquest_local_claims`
- `eventquest_local_payouts`
- `eventquest_local_giveaway_entries`
- `stagedrop_device_id`

Resetting local preferences from Settings clears app preferences and local event data for that browser. It does not delete Supabase rows.

## Security and production gaps

Before treating this as a production payout system, add:

1. Server-side atomic enforcement for giveaway close state and submission limits.
2. Authentication/authorization for creator-owned event and payout records.
3. A reconciliation worker or supported Nimiq indexer integration that verifies transaction inclusion and confirmations.
4. Balance and fee checks before starting a payout queue.
5. A provider-supported batch or distribution-contract mechanism if 100+ payouts must avoid individual approvals.
6. Rate limiting and stronger anti-sybil controls for public giveaway links.

Do not replace the sequential queue with a backend signer without designing key custody, authorization, replay protection, audit logging, and failure recovery.

## Current status

The approved creator workflow, quiz rewards, giveaway submissions, payout record creation, retryable payout queue, QR generation, Settings, and local development fallback are implemented. Payouts remain creator-approved, one transaction request at a time, and are not marked blockchain-confirmed automatically.
