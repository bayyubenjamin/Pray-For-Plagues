# Nhost setup — Pray For Plagues

Visual design is unchanged. This file is the backend checklist.

## 1. Create project
1. Sign up at https://app.nhost.io
2. Create project `pray-for-plagues`
3. Copy **subdomain** and **region**

## 2. Env
Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_NHOST_SUBDOMAIN=xxxx
NEXT_PUBLIC_NHOST_REGION=eu-central-1
```

## 3. Database
In Nhost → Hasura → Data → SQL, run `nhost/schema.sql`.

Track tables `waitlist` and `profiles` in Hasura.

## 4. Permissions
- `waitlist`: insert for public / anonymous
- `profiles`: select / insert / update (tighten later to wallet owner)

## 5. Auth (optional next)
- Enable Email + Password or Magic Link
- Later: sign a nonce with the wallet and attach `profiles.wallet` to `auth.users`

## 6. Frontend already wired
- `lib/nhost.ts` — client
- `components/Providers.tsx` — NhostProvider + Wagmi
- `components/WaitlistForm.tsx` — GraphQL insert
- `components/ConnectWallet.tsx` — injected wallet
- `/profile` — wallet profile shell
- `/waitlist` — dedicated waitlist page

## 7. After env is set
```bash
npm install
npm run dev
```

Join waitlist will write to Nhost. Without env, UI still works and shows success locally only when request is skipped — set env before launch.
