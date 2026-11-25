# Pray For Plagues — NFT assets (OpenSea-ready)

Base images, one per rarity. Same vial, liquid colour = rarity.

| Rarity | File | Supply | Vial | Liquid | Cap | Dose |
| --- | --- | --- | --- | --- | --- | --- |
| COMMON | `images/common.jpg` | 1.100 | Standard Vial | Green Fluid | Metal Cap | 1–2 |
| RARE | `images/rare.jpg` | 500 | Reinforced Vial | Blue Fluid | Black Cap | 2–3 |
| EPIC | `images/epic.jpg` | 250 | Dark Vial | Purple Fluid | Bone Cap | 3–4 |
| LEGENDARY | `images/legendary.jpg` | 120 | Ancient Vial | Gold Fluid | Gold Cap | 4–5 |
| MYTHIC | `images/mythic.jpg` | 30 | Cracked Vial | Red Fluid | Rusted Cap | 5+ |

Total: **2.000 vials**. All images 1280×1920 JPG (quality 90, 340-560 KB each). Label text on every
image: `PLAGUES ANTIDOTE` + barcode + `THE PLAGUE HAS ARRIVED ON
ROBINHOOD CHAIN`.

> Website copies: `public/images/vials/*.jpg` are web-optimized versions
> of these masters (640×960, quality 82, 74–142 KB each), shown on the
> home page and Inventory. If a master changes, re-export the matching
> web copy from it — never edit the web copy as the source of truth.

## Metadata

- `metadata/<rarity>.json` — one OpenSea template per rarity (ERC-721
  metadata standard: `name`, `description`, `image`, `attributes`).
  `image` uses `ipfs://REPLACE_WITH_CID/<rarity>.jpg` until the real CID
  is known.
- `collection.json` — OpenSea collection metadata. Royalty is **0**
  and `fee_recipient` is a placeholder on purpose: decide the royalty %
  and treasury wallet before deploy, then fill them in.
- `scripts/generate-nft-metadata.mjs` — expands the 5 templates into
  2.000 per-token files (`1.json` … `2000.json`). Token IDs in rarity
  order: Common 1–1100, Rare 1101–1600, Epic 1601–1850, Legendary
  1851–1970, Mythic 1971–2000. Purity / Stability / Potency are
  deterministic per token id (same input = same output).

## Deploy checklist (future)

1. Upload `assets/nft/images/*.jpg` to IPFS, note the CID.
2. `node scripts/generate-nft-metadata.mjs --cid <CID>`
   (output: `assets/nft/generated/`, git-ignored — regenerate any time).
3. Upload `assets/nft/generated/` to IPFS, note that CID.
4. Deploy the ERC-721 contract on Robinhood Chain (4663) with
   `baseURI = ipfs://<generated-CID>/` and 2.000 max supply.
5. Fill `collection.json` (royalty + treasury) and create the OpenSea
   collection pointing at the contract.
6. Do **not** mint from this repo — mint happens on OpenSea / via the
   contract, never from the Next.js site.
