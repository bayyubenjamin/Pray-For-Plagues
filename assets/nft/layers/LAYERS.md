# PFP vial layers — layer spec

Gambar final tiap NFT = **base + 3 overlay**, digabung
`assets/nft/scripts/composite-vial.py` saat metadata diminta (image API).
Satu set overlay untuk SEMUA rarity — konsistensi dijamin karena file-nya
sama; hanya warna glow yang beda per rarity (diatur kode saat composite).

## File

- `assets/nft/layers/purity-murk.png` — 1280x1920 RGBA
- `assets/nft/layers/stability-cracks.png` — 1280x1920 RGBA
- `assets/nft/layers/potency-glow.png` — 1280x1920 RGBA (grayscale, ditint
  saat composite)
- `assets/nft/scripts/make-layers.py` — generator overlay (seed tetap:
  murk 11, cracks 7, glow 21). Jalankan ulang untuk regenerate
  byte-identical.
- `assets/nft/scripts/composite-vial.py` — compositor CLI (lihat header
  file). Base: `assets/nft/images/<rarity>.jpg` (1280x1920), fallback ke
  `public/images/vials/<rarity>.jpg` (640x960).
- `public/images/vials/layers/` — salinan ketiga overlay yang sama, diserve
  ke browser untuk preview live di Lab (`lib/vial-layers.ts` +
  `components/VialPreview.tsx`). Isinya harus selalu sama dengan folder ini.

## Geometri (1280x1920, diukur dari master)

- Badan vial x ~360-920, tengah x=640. Tutup y ~210-460.
- Cairan band A (di atas label) y 600-860.
- Label y 900-1560 — overlay TIDAK boleh menutupi label.
- Cairan band B (di bawah label) y 1580-1780. Dasar botol y ~1800-1860.
- Retak dibatasi siluet kaca (`_glass_x_range` di generator): leher sempit,
  bahu melebar, badan lurus — supaya tidak keluar ke latar hitam.

## Overlay dan kurva opacity

| Overlay | Isi | Opacity saat composite |
|---|---|---|
| Purity — murk | Tint coklat gelap + sedimen di band cairan, makin pekat ke bawah | `(100 - purity)/100` |
| Stability — cracks | 4 retak panjang dari titik benturan (bahu + bawah), cabang jarang | `(100 - stability)/100` |
| Potency — glow | Glow radial lembut + partikel, grayscale | screen-blend, kekuatan `potency/100 * 0.8` |

- Purity 100 / Stability 100 / Potency 0 → overlay tidak terlihat (gambar = base).
- Purity rendah → cairan keruh gelap + sedimen. Stability rendah → retak
  kelihatan. Potency tinggi → glow + partikel kuat.
- Kurva yang sama dipakai di browser (`lib/vial-layers.ts`: `murkAlpha`,
  `cracksAlpha`, `glowStrength`) dan di compositor Python — preview di Lab
  dan gambar final NFT harus cocok.

## Warna glow per rarity (ditint saat composite)

- Common `#22C55E` hijau, Rare `#3B82F6` biru, Epic `#A855F7` ungu,
  Legendary `#EAB308` emas, Mythic `#EF4444` merah.

## Catatan desain

- Gambar flat yang ada TIDAK bisa dibelah — overlay adalah asset baru di atas
  base. Base tiap rarity sudah punya ambience sendiri (Mythic retak + asap
  merah, Legendary asap emas + rune); overlay dibuat netral supaya tidak
  bentrok: murk warna coklat netral (bukan hijau), retak tipis di kaca saja,
  glow ditint per rarity.
- v1 (28 Nov 2026 00:40): retak terlalu rapat (kelihatan seperti jaring) dan
  murk terlalu tipis. v2: retak 4 jalur panjang + cabang jarang + clamp
  siluet kaca; murk alpha naik (150-240) + sedimen lebih banyak; glow core
  dilembutkan (110/170) + kekuatan 0.8. v2 diverifikasi visual: kelima rarity
  di 60/60/60 + Common 15/15/15 vs 95/95/95 — ketiga layer aktif di semua
  rarity.

## Yang belum (di luar asset ini)

- Image API yang memanggil compositor saat tokenURI diminta (Vercel function
  + sharp/PIL) — metadata OpenSea refresh saat stat berubah. Tergantung
  desain kontrak (stat mutable on-chain + tokenURI dinamis).
