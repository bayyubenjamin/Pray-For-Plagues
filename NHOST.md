# Nhost + NFT waitlist

Waitlist ini allowlist mint NFT (wallet = alamat OpenSea).

## 1. Project
Buat project di https://app.nhost.io → copy **Subdomain**, **Region**, **Admin Secret**.

## 2. SQL
Dashboard → Database → SQL → paste `nhost/schema.sql` → Run.

## 3. Track tables (wajib)
Hasura → Data → Untracked → track:
- `waitlist`
- `profiles`
- `task_completions`

Kalau constraint `waitlist_wallet_key` tidak ter-detect:
Hasura → waitlist → Modify → reload metadata.

## 4. Env lokal + Vercel
```
NEXT_PUBLIC_NHOST_SUBDOMAIN=xxxx
NEXT_PUBLIC_NHOST_REGION=eu-central-1
NHOST_ADMIN_SECRET=xxxx
NEXT_PUBLIC_OPENSEA_URL=https://opensea.io/collection/slug-kamu
NEXT_PUBLIC_OPENSEA_SLUG=slug-kamu
```

`NHOST_ADMIN_SECRET` **jangan** pakai prefix NEXT_PUBLIC (server only).

GraphQL URL default:
`https://<subdomain>.hasura.<region>.nhost.run/v1/graphql`

Kalau beda, set `NHOST_GRAPHQL_URL`.

## 5. Cek
1. Connect wallet Robinhood
2. Profile → isi email → JOIN NFT WAITLIST
3. Hasura → Data → waitlist → harus ada row wallet + email

Duplicate wallet/email = update row yang sama (upsert).
