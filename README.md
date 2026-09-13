# Pray For Plagues

Utility site for the Pray For Plagues NFT on Robinhood Chain.

Production: [https://prayforplagues.xyz](https://prayforplagues.xyz)

OpenSea is only the future secondary market. This repository is the product: identity, allowlist, points, referrals, and (later) mint / upgrade / `$PLAGUES`.

## Product rules

Waitlist phase:

1. User connects **X** (OAuth 2.0 PKCE).
2. User pastes an EVM **wallet** (`0x` + 40 hex). Extension connect is optional.
3. User pastes **email** and joins.
4. Backend enforces **1 X = 1 wallet = 1 email**.
5. After join, that X account may only use the pasted wallet.

Inventory and Upgrade UI is locked behind **SOON**. Lab CTA opens a waitlist modal instead of minting.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js App Router, React 19, Tailwind |
| Wallet | wagmi + viem, Robinhood Chain `4663` |
| Auth social | X OAuth 2.0 (`/api/x/start`, `/api/x/callback`) |
| Data | Nhost / Hasura GraphQL + admin secret on server routes |
| Hosting | Vercel → custom domain `prayforplagues.xyz` |

Visual language (green glow, Bangers, lab chrome) must stay intact when editing UI.

## Routes

| Path | Role |
| --- | --- |
| `/` | Hero. **ENTER LAB** opens waitlist / “you are on the waitlist” modal. Antidote cards blurred SOON. |
| `/task` | Hub: points HUD, Connect X, waitlist, referral link, leaderboard. |
| `/profile` | Identity, optional wallet connect, waitlist copy. |
| `/inventory` | Locked SOON. |
| `/upgrade` | Locked SOON. |
| `/leaderboard` | Redirects to `/task#board`. |
| `/waitlist` | Legacy route; prefer `/task`. |

## API

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/x/start` | GET | Begin X OAuth. |
| `/api/x/callback` | GET | Exchange code, read `/2/users/me`, return to `/task?x=connected&handle=`. |
| `/api/waitlist` | POST | Validate + insert allowlist row. Award referral if valid. |
| `/api/waitlist` | GET | `?x=&wallet=&email=` uniqueness + locked wallet. |
| `/api/rank` | GET | Leaderboard by `waitlist.points`. |
| `/api/rank` | POST | Sync local task points onto the waitlist row. |

Waitlist POST rejects when Nhost is not configured (`503`). Duplicates return `409`.

## Referral

Share link:

```
https://prayforplagues.xyz/task?ref={x_handle}
```

`?ref=` is stored in `localStorage` and auto-fills **REF CODE**. If the visitor arrived via that link, the field is **read-only**.

On a valid first-time waitlist insert:

- Invitee must be a new X + wallet + email.
- Referrer handle must already exist on `waitlist`.
- Self-referral is rejected.
- Referrer receives **+200** points (`_inc` on `waitlist.points`).

## Points (current)

| Task | Points |
| --- | --- |
| Connect wallet | 100 |
| Switch Robinhood | 150 |
| Connect X | 200 |
| Join waitlist | 150 |
| Visit lab (legacy) | 50 |
| Valid referral (inviter) | 200 |

Task progress is stored in `localStorage` (`pfp-player`) and synced to Nhost when a waitlist row exists. Rank is computed from `waitlist.points` descending.

## Repository map

```
app/
  page.tsx                 Home + ENTER LAB
  task/page.tsx            Task hub
  profile/page.tsx         Profile
  inventory/page.tsx       SOON
  upgrade/page.tsx         SOON
  api/waitlist/route.ts    Allowlist + uniqueness + referral award
  api/rank/route.ts        Leaderboard + point sync
  api/x/start|callback     X OAuth
components/
  Navbar.tsx               HOME / INVENTORY / UPGRADE / TASK / PROFILE
  WaitlistForm.tsx         X → wallet → email → ref
  EnterLabButton.tsx       Modal trigger
  LabGateModal.tsx         Waitlist vs already-joined card
  AntidoteCard.tsx         Blur + SOON
lib/
  config.ts                Robinhood chain
  points.ts                Local tasks
  referral.ts              ref capture / lock
  nhost.ts                 Public GraphQL URL
  nhost-server.ts          Admin-secret fetch
nhost/schema.sql           Tables + unique constraints
```

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Environment

```
NEXT_PUBLIC_APP_URL=https://prayforplagues.xyz
NEXT_PUBLIC_NHOST_SUBDOMAIN=
NEXT_PUBLIC_NHOST_REGION=
NHOST_ADMIN_SECRET=          # or HASURA_GRAPHQL_ADMIN_SECRET
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=https://prayforplagues.xyz/api/x/callback
```

`NHOST_ADMIN_SECRET` is server-only. Nhost dashboard stores the same value as `HASURA_GRAPHQL_ADMIN_SECRET` (write-only; set a new value if you cannot view the old one).

## Nhost

1. Create a project at [app.nhost.io](https://app.nhost.io).
2. Run `nhost/schema.sql` in Database → SQL.
3. If `waitlist` already existed, also run:

```sql
alter table public.waitlist add column if not exists points integer not null default 0;
alter table public.waitlist add column if not exists referred_by text;
alter table public.waitlist add constraint waitlist_wallet_key unique (wallet);
alter table public.waitlist add constraint waitlist_x_handle_key unique (x_handle);
alter table public.waitlist add constraint waitlist_email_key unique (email);
```

4. Hasura → track `waitlist` and reload metadata so `points` / `referred_by` exist in GraphQL.
5. Do **not** use Postgres roles `anon` / `authenticated` in RLS `TO` clauses (those are Hasura roles). Policies in `schema.sql` apply to `PUBLIC`.

## X Developer App

1. [developer.x.com](https://developer.x.com) → project + app.
2. User authentication on. Type: Web App.
3. Callback exactly: `https://prayforplagues.xyz/api/x/callback`
4. Website: `https://prayforplagues.xyz`
5. Read scopes: `tweet.read users.read offline.access`
6. Put Client ID / Secret in Vercel env and redeploy.

## Wallet / chain

Robinhood Chain id `4663`, RPC `https://rpc.mainnet.chain.robinhood.com` (`lib/config.ts`). Waitlist does not require a live connection; the pasted address is the source of truth.

## What is intentionally unfinished

- NFT contract, mint, allowlist-on-chain
- `$PLAGUES` token and upgrade transactions
- Inventory ownership from chain
- Verified social tasks beyond Connect X (follow/tweet need write scopes + proof)

## Working agreement

- Do not restyle the cyber-lab look unless asked.
- Do not treat OpenSea as the product backend.
- Unique constraints live in Postgres; UI checks are only UX.
- Never commit secrets. Admin secret and X client secret stay in Vercel / `.env.local`.
