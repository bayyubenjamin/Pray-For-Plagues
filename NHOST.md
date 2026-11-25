# Nhost + NFT waitlist

Waitlist ini allowlist mint NFT. Alurnya: **X OAuth → paste wallet EVM →
paste email → join**. Backend menegakkan **1 X = 1 wallet = 1 email** —
duplikat X / wallet / email ditolak `409`, bukan di-upsert.

## 1. Project
Buat project di https://app.nhost.io → copy **Subdomain**, **Region**, **Admin Secret**.

## 2. SQL
Dashboard → Database → SQL → jalankan berurutan:
1. `nhost/schema.sql` — tabel `waitlist` + `profiles`, unique constraints, RLS.
2. `nhost/social_tasks.sql` — kolom `social_tasks` di `waitlist`.
3. `nhost/tasks.sql` — tabel `tasks` (daftar social task + poin).
4. `nhost/profiles.sql` — mirror `waitlist` → `profiles` (sekali jalan + kolom
   `connected_wallet`).

## 3. Track tables (wajib)
Hasura → Data → Untracked → track:
- `waitlist`
- `profiles`
- `tasks`

Kalau constraint `waitlist_wallet_key` tidak ter-detect:
Hasura → waitlist → Modify → reload metadata.

## 4. RLS
Policy di `schema.sql` / `profiles.sql` sengaja **menolak akses langsung**
(`using (false)`): publik tidak boleh baca/tulis tabel langsung. Semua akses
lewat API route Next.js yang memakai admin secret (admin secret melewati
RLS). Jangan ubah policy ini menjadi `using (true)`.

## 5. Env lokal + Vercel
Lihat `.env.example`. Yang wajib:
```
NEXT_PUBLIC_NHOST_SUBDOMAIN=xxxx
NEXT_PUBLIC_NHOST_REGION=eu-central-1
NHOST_ADMIN_SECRET=xxxx
```

`NHOST_ADMIN_SECRET` **jangan** pakai prefix NEXT_PUBLIC (server only).

GraphQL URL default:
`https://<subdomain>.hasura.<region>.nhost.run/v1/graphql`

Kalau beda, set `NHOST_GRAPHQL_URL`.

## 6. Cek
1. Connect X di `/task`
2. Paste wallet Robinhood → isi email → JOIN WAITLIST
3. Hasura → Data → waitlist → harus ada row X + wallet + email + points 150

Duplicate wallet/email/X = ditolak, bukan update row yang sama.
