#!/usr/bin/env python3
"""Composite a Pray For Plagues vial image from base + stat overlays.

Usage (from the repo root):
  python3 assets/nft/scripts/composite-vial.py --rarity common \\
      --purity 60 --stability 60 --potency 60 --out out.jpg [--size 1280]

- Base: assets/nft/images/<rarity>.jpg (1280x1920), falling back to
  public/images/vials/<rarity>.jpg (640x960) when the full-res file is
  missing.
- Overlays: assets/nft/layers/*.png
  (one set, shared by all rarities — consistency by construction)
- Purity   : murk alpha = (100 - purity)/100   (alpha_composite)
- Stability: cracks alpha = (100 - stability)/100    (alpha_composite)
- Potency  : glow is grayscale; tint it with the rarity colour, then
             screen-blend onto the base, strength = potency/100 * 0.8.
             At potency 0 nothing is added.

Rarity colours (match the project palette):
  common #22C55E, rare #3B82F6, epic #A855F7,
  legendary #EAB308, mythic #EF4444
"""
import argparse
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[3]
LAYERS = ROOT / "assets" / "nft" / "layers"

RARITY_COLORS = {
    "common": (34, 197, 94),
    "rare": (59, 130, 246),
    "epic": (168, 85, 247),
    "legendary": (234, 179, 8),
    "mythic": (239, 68, 68),
}


def _base_path(rarity):
    full = ROOT / "assets" / "nft" / "images" / f"{rarity}.jpg"
    if full.exists():
        return full
    return ROOT / "public" / "images" / "vials" / f"{rarity}.jpg"


def _scale_alpha(img, factor):
    """Multiply an RGBA image's alpha channel by factor (0..1)."""
    if factor <= 0:
        return None
    if factor >= 1:
        return img
    r, g, b, a = img.split()
    a = a.point(lambda v: int(v * factor))
    out = Image.merge("RGBA", (r, g, b, a))
    return out


def composite(rarity, purity, stability, potency, size=None):
    base = Image.open(_base_path(rarity)).convert("RGB")
    if size is None:
        size = base.width
    w, h = size, int(size * 1.5)
    if base.size != (w, h):
        base = base.resize((w, h), Image.LANCZOS)
    out = base.convert("RGBA")

    # Purity: murk over the liquid bands.
    murk = Image.open(LAYERS / "purity-murk.png").convert("RGBA")
    if murk.size != (w, h):
        murk = murk.resize((w, h), Image.LANCZOS)
    murk = _scale_alpha(murk, (100 - purity) / 100 * 1.0)
    if murk is not None:
        out = Image.alpha_composite(out, murk)

    # Stability: cracks on the glass.
    cracks = Image.open(LAYERS / "stability-cracks.png").convert("RGBA")
    if cracks.size != (w, h):
        cracks = cracks.resize((w, h), Image.LANCZOS)
    cracks = _scale_alpha(cracks, (100 - stability) / 100)
    if cracks is not None:
        out = Image.alpha_composite(out, cracks)

    # Potency: tint the grayscale glow with the rarity colour, screen it in.
    strength = potency / 100 * 0.8
    if strength > 0:
        glow = Image.open(LAYERS / "potency-glow.png").convert("RGBA")
        if glow.size != (w, h):
            glow = glow.resize((w, h), Image.LANCZOS)
        alpha = glow.split()[3]
        color = RARITY_COLORS[rarity]
        tinted = Image.new("RGB", glow.size, (0, 0, 0))
        solid = Image.new("RGB", glow.size, color)
        tinted = Image.composite(solid, tinted, alpha)
        base_rgb = out.convert("RGB")
        screened = ImageChops.screen(base_rgb, tinted)
        out = Image.blend(base_rgb, screened, strength).convert("RGBA")

    return out.convert("RGB")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--rarity", required=True, choices=sorted(RARITY_COLORS))
    ap.add_argument("--purity", type=int, default=60)
    ap.add_argument("--stability", type=int, default=60)
    ap.add_argument("--potency", type=int, default=60)
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", type=int, default=None)
    args = ap.parse_args()
    img = composite(args.rarity, args.purity, args.stability, args.potency, args.size)
    img.save(args.out, quality=92)
    print("wrote", args.out, img.size)
