# PRAY FOR PLAGUES

Frontend for the plague lab on Robinhood Chain.

## Stack
- Next.js + Tailwind (existing visual system kept as-is)
- wagmi / viem for wallet
- Nhost for waitlist + profiles (see `NHOST.md`)

## Dev
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Routes
- `/` home + waitlist block
- `/waitlist`
- `/profile`
- `/inventory` `/upgrade` `/leaderboard`

## Backend
Follow `NHOST.md` then paste `nhost/schema.sql` into Hasura.
