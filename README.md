# Pray For Plagues

Utility site for the Pray For Plagues NFT on Robinhood Chain.

Production: [https://prayforplagues.xyz](https://prayforplagues.xyz)

OpenSea is only the future secondary market. This repository is the product: identity, allowlist, points, referrals, Vault briefing, and (later) mint / Lab mutation / `$PLAGUES`.

## Product rules

Waitlist phase (CONTAGION):

1. User connects **X** (OAuth 2.0 PKCE).
2. User pastes an EVM **wallet** (`0x` + 40 hex). Extension connect is optional.
3. User pastes **email** and joins.
4. Backend enforces **1 X = 1 wallet = 1 email**.
5. After join, that X account may only use the pasted wallet.

Rank maps to a mint class (not a guaranteed rarity):

- Rank 1–50 → **Patient Zero** (first extraction)
- Rank 51–250 → **Quarantine** (GTD)
- Rank 251+ → **Public** (FCFS)
- Not on list → **Unlisted**

`$PLAGUES` claim stays sealed until after mint. Lab CTA opens a waitlist modal instead of minting.

## Outbreak protocol

| Phase | Code | Status |
| --- | --- | --- |
| 0 | CONTAGION | Live waitlist |
| 1 | ISOLATION | Snapshot |
| 2 | OUTBREAK | Mint 2,000 vials |
| 3 | MUTATION | Lab upgrade |
| 4 | CURE | `$PLAGUES` claim |
| 5 | PANDEMIC | Per-vial vault |

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
| `/` | Hero + outbreak protocol + strain preview. |
| `/vault` | Redirects to `/inventory`. |
| `/inventory` | Held vials (on-chain ownership check not live yet — count is 0 until mint + chain read). |
| `/task` | Hub: points HUD, mint class, Connect X, waitlist, referral, leaderboard. |
| `/profile` | Identity + mint class. |
| `/upgrade` | Lab mutation locked (phase 3). |
| `/leaderboard` | Redirects to `/task#board`. |
| `/waitlist` | Legacy route; redirects to `/profile`. |

## API

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/x/start` | GET | Begin X OAuth. |
| `/api/x/callback` | GET | Exchange code, read `/2/users/me`, return to `/task?x=connected&handle=`. |
| `/api/waitlist` | POST | Validate + insert allowlist row. Award referral if valid. |
| `/api/waitlist` | GET | `?x=&wallet=&email=` uniqueness + locked wallet. |
| `/api/rank` | GET | Leaderboard by `waitlist.points`. |
| `/api/rank` | POST | Read-only: returns the caller's current server points + rank. Never accepts points from the client. |
| `/api/profile` | GET | Profile + waitlist row + wallet mismatch + referral stats. |
| `/api/profile` | POST | Link connected wallet to an X identity. Never accepts points. |
| `/api/social` | POST | Store claimed social task ids (self-reported, not X-verified). |
| `/api/stats` | GET | `?x=` points, rank, task progress, referral counts. |
| `/api/tasks` | GET | Active tasks (from Nhost `tasks`, fallback to built-in list). |
| `/api/tasks` | POST | Referral validation, driven by stored `social_tasks` in the DB (≥ 4). |

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

Task progress is stored in `localStorage` (`pfp-player`) for the local HUD.
The server is the only authority for waitlist points: `POST /api/rank`
returns the stored total and ignores any client-sent points, and
`POST /api/profile` cannot change points. Rank is computed from
`waitlist.points` descending.

## Points security

- Point values live in one place: `lib/points.ts` (`TASKS`). Server routes
  import from there; no second copy of the numbers in any API route.
- `POST /api/rank` is read-only (returns server points + rank). The old
  client-controlled `_set: { points }` sync is removed.
- `POST /api/tasks` validates referrals from stored `social_tasks` in the DB
  (≥ 4), never from a client-sent `taskCount`. Referral bonus is 200 points
  (`REFERRAL_POINTS`), the same value as the waitlist award.
- Social tasks are **self-reported** (open link + 10 s timer) and are not
  proof of a follow/like/repost — X verification is not implemented yet.
  Points from them are participation points, not verified actions.
- RLS on `waitlist` / `profiles` denies direct access (`using (false)`).
  All access goes through the Next.js API routes with the admin secret.

## Repository map

```
app/
  page.tsx                 Home + protocol + strain preview
  vault/page.tsx           Redirect → /inventory
  inventory/page.tsx       Held vials (ownership check not live yet)
  task/page.tsx            Task hub
  profile/page.tsx         Profile + mint class
  upgrade/page.tsx         Lab sealed
  api/waitlist/route.ts    Allowlist + uniqueness + referral award
  api/rank/route.ts        Leaderboard + read-only points lookup
  api/profile/route.ts     Profile read + wallet linking (no points)
  api/social/route.ts      Store claimed social tasks (self-reported)
  api/stats/route.ts       Points / rank / referral stats
  api/tasks/route.ts       Task list + DB-driven referral validation
  api/x/start|callback     X OAuth
components/
  Navbar.tsx               HOME / VAULT / LAB / TASK / PROFILE
  ProtocolRoadmap.tsx      Phase cards
  MintClassCard.tsx        Rank → class
  WaitlistForm.tsx         X → wallet → email → ref
  EnterLabButton.tsx       Modal trigger
  LabGateModal.tsx         Waitlist vs already-joined card
  AntidoteCard.tsx         Strain briefing cards
lib/
  protocol.ts              Phases, rarities, mint class
  config.ts                Robinhood chain
  points.ts                Local tasks + single source of point values
  social.ts                Social actions (points derived from points.ts)
  referral.ts              ref capture / lock (+200)
  nhost.ts                 Public GraphQL URL
  nhost-server.ts          Admin-secret fetch
nhost/schema.sql           Tables + unique constraints + deny-direct RLS
nhost/social_tasks.sql     social_tasks column
nhost/tasks.sql            tasks table (social task catalog)
nhost/profiles.sql         profiles mirror + deny-direct RLS
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
2. Run `nhost/schema.sql`, then `nhost/social_tasks.sql`, `nhost/tasks.sql`,
   and `nhost/profiles.sql` in Database → SQL.
3. If `waitlist` already existed, also run:

```sql
alter table public.waitlist add column if not exists points integer not null default 0;
alter table public.waitlist add column if not exists referred_by text;
alter table public.waitlist add column if not exists social_tasks text[] not null default '{}';
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
- `$PLAGUES` token and Lab upgrade transactions
- Vault ownership from chain
- Verified social tasks beyond Connect X (follow/tweet need write scopes + proof)

## Working agreement

- Do not restyle the cyber-lab look unless asked.
- Do not treat OpenSea as the product backend.
- Unique constraints live in Postgres; UI checks are only UX.
- Never commit secrets. Admin secret and X client secret stay in Vercel / `.env.local`.
