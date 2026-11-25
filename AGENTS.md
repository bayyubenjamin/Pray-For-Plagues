# Pray For Plagues — repo rules (short version)

- Product: waitlist/allowlist site for the Pray For Plagues NFT on Robinhood
  Chain (4663). Mint happens on OpenSea; this repo never mints. `$PLAGUES`
  and the Lab are sealed until after mint.
- Flow (do not change): X OAuth → paste EVM wallet → paste email → join.
  Backend enforces 1 X = 1 wallet = 1 email. Rank 1–50 Patient Zero,
  51–250 Quarantine, 251+ Public.
- Points: `lib/points.ts` (TASKS) is the single source of truth. The server
  owns waitlist points — clients never send points (`POST /api/rank` is
  read-only). Social tasks are self-reported, NOT verified by X.
- Data: Nhost/Hasura via admin secret in server routes only. RLS denies
  direct table access; the public never talks to Hasura directly.
- Visuals: keep the green lab look (Bangers + Share Tech Mono, green glow).
  Clean and premium, no new animation libraries (CSS/Tailwind only).
- Never commit secrets. Admin secret and X client secret live in Vercel /
  `.env.local` only. See `.env.example` and `README.md`.
