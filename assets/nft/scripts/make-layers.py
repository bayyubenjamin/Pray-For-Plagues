#!/usr/bin/env python3
"""Generate the 3 parametric stat overlays for Pray For Plagues vials.

One overlay set, shared by ALL 5 rarities (consistency by construction).
Only the Potency glow gets a per-rarity colour tint, applied at composite
time by composite-vial.py — the overlay files themselves are identical
for every rarity.

Canvas: 1280x1920 RGBA, matching the NFT bases in
assets/nft/images/*.jpg (1280x1920).

Geometry (measured from the masters, 1280x1920):
- Bottle body x ~360-920, centre x=640.
- Cap y ~210-460. Liquid band A (above label) y 600-860.
- Label band y 900-1560 (overlays must NOT cover the label).
- Liquid band B (below label) y 1580-1780. Bottle base y ~1800-1860.

Overlays (full strength; the compositor scales alpha by stat value):
- purity-murk.png   : dark murk tint + sediment speckles over the liquid
                      bands. Compositor alpha = (100 - purity)/100.
                      At purity 100 the layer is invisible.
- stability-cracks.png : thin glass-crack polylines on the glass, clipped
                      to avoid the label rect. Compositor alpha =
                      (100 - stability)/100. At stability 100 invisible.
- potency-glow.png  : white soft radial glow + particles (grayscale).
                      Compositor tints it with the rarity colour and
                      screen-blends it. Opacity = potency/100 * 0.8.
                      At potency 0 the layer is invisible.

All randomness uses fixed seeds so the assets are reproducible.
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

W, H = 1280, 1920
ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "assets" / "nft" / "layers"
OUT.mkdir(parents=True, exist_ok=True)

# Liquid bands (x0, y0, x1, y1) — inside the glass, clear of the label.
BAND_A = (400, 600, 880, 860)
BAND_B = (400, 1580, 880, 1780)
# Label rect — overlays must not cover it.
LABEL = (380, 900, 900, 1560)


def feathered_rect_mask(box, feather=28):
    """Soft-edged mask for a rect: white inside, feathered border."""
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.rectangle(box, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(feather))


def vertical_gradient_mask(box, top_alpha, bottom_alpha):
    """Mask whose alpha ramps top->bottom inside box (feathered edges)."""
    x0, y0, x1, y1 = box
    h = y1 - y0
    col = Image.new("L", (1, h))
    px = col.load()
    for y in range(h):
        t = y / max(1, h - 1)
        px[0, y] = int(top_alpha + (bottom_alpha - top_alpha) * t)
    grad = col.resize((x1 - x0, h))
    full = Image.new("L", (W, H), 0)
    full.paste(grad, (x0, y0))
    return full.filter(ImageFilter.GaussianBlur(24))


def make_purity():
    """Murk: dark olive-brown tint, heavier toward the bottom of each
    liquid band (sediment settles), plus speckles in the lower band."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    murk_rgb = (48, 42, 20)
    for box, top_a, bot_a in ((BAND_A, 150, 230), (BAND_B, 170, 240)):
        alpha = vertical_gradient_mask(box, top_a, bot_a)
        # keep the tint inside the soft band shape
        shape = feathered_rect_mask(box)
        alpha = Image.composite(alpha, Image.new("L", (W, H), 0), shape)
        tint = Image.new("RGBA", (W, H), murk_rgb + (0,))
        tint.putalpha(alpha)
        layer = Image.alpha_composite(layer, tint)
    # sediment speckles, denser toward the bottom of band B
    rng = random.Random(11)
    d = ImageDraw.Draw(layer)
    for _ in range(340):
        x = rng.randint(BAND_B[0] + 10, BAND_B[2] - 10)
        # bias y toward the bottom of the band
        y = int(BAND_B[1] + (BAND_B[3] - BAND_B[1]) * (rng.random() ** 0.5))
        r = rng.randint(1, 4)
        a = rng.randint(110, 200)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(40, 36, 18, a))
    layer.save(OUT / "purity-murk.png")
    print("purity-murk.png", layer.size)


def _inside_label(x, y):
    return LABEL[0] <= x <= LABEL[2] and LABEL[1] <= y <= LABEL[3]


def _glass_x_range(y):
    """Allowed x-range of the glass silhouette at height y (1280x1920).
    Neck is narrow, shoulders flare out, body is straight, base rounds in."""
    if y < 430:
        return (520, 760)
    if y < 520:
        return (500, 780)
    if y < 600:
        t = (y - 520) / 80
        return (int(500 - 120 * t), int(780 + 120 * t))
    if y < 1800:
        return (385, 895)
    return (410, 870)


def _crack_walk(draw_dark, draw_light, rng, x, y, angle, steps, width):
    """One long jagged crack; stops when it would cross the label or
    leave the glass silhouette."""
    for _ in range(steps):
        angle += rng.uniform(-0.35, 0.35)
        length = rng.uniform(18, 30)
        nx = x + math.cos(angle) * length
        ny = y + math.sin(angle) * length
        lo, hi = _glass_x_range(ny)
        nx = max(lo, min(hi, nx))
        ny = max(430, min(1830, ny))
        if _inside_label((x + nx) / 2, (y + ny) / 2):
            return (x, y)
        draw_dark.line((x, y, nx, ny), fill=(15, 15, 15, 235), width=width)
        draw_light.line((x + 1, y + 1, nx + 1, ny + 1),
                        fill=(210, 210, 210, 110), width=1)
        # rare branch
        if rng.random() < 0.15:
            _crack_walk(draw_dark, draw_light, rng, nx, ny,
                        angle + rng.uniform(0.7, 1.4) * rng.choice((-1, 1)),
                        max(3, steps // 3), max(1, width - 1))
        x, y = nx, ny
    return (x, y)


def make_stability():
    """Glass cracks: a few long jagged cracks radiating from impact
    points on the glass only — never over the label, never off the
    glass silhouette (no net/web look)."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dark = ImageDraw.Draw(layer)
    light = ImageDraw.Draw(layer)
    rng = random.Random(7)
    starts = [
        (450, 560, -0.4),   # left shoulder, running down
        (830, 620, math.pi + 0.4),  # right shoulder, running down
        (420, 1650, -0.9),  # lower-left glass, running up
        (860, 1700, math.pi + 0.9),  # lower-right glass, running up
    ]
    for x, y, angle in starts:
        _crack_walk(dark, light, rng, x, y, angle,
                    rng.randint(16, 24), rng.randint(2, 3))
    layer.save(OUT / "stability-cracks.png")
    print("stability-cracks.png", layer.size)


def make_potency():
    """Glow: soft white radial centred on the liquid mass + particles.
    Grayscale — the compositor tints it with the rarity colour."""
    glow = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(glow)
    # soft radial core around the liquid centre (behind the label too,
    # so the whole vial reads as glowing from inside)
    d.ellipse((640 - 330, 1200 - 560, 640 + 330, 1200 + 560), fill=110)
    d.ellipse((640 - 200, 1200 - 380, 640 + 200, 1200 + 380), fill=170)
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    # particles, concentrated in the liquid bands
    rng = random.Random(21)
    dots = Image.new("L", (W, H), 0)
    dd = ImageDraw.Draw(dots)
    for _ in range(46):
        band = BAND_A if rng.random() < 0.45 else BAND_B
        x = rng.randint(band[0] + 15, band[2] - 15)
        y = rng.randint(band[1] + 10, band[3] - 10)
        r = rng.randint(2, 6)
        dd.ellipse((x - r, y - r, x + r, y + r), fill=rng.randint(150, 255))
    # a few embers drifting outside the bottle
    for _ in range(14):
        x = rng.randint(300, 980)
        y = rng.randint(500, 1850)
        r = rng.randint(1, 3)
        dd.ellipse((x - r, y - r, x + r, y + r), fill=rng.randint(90, 180))
    dots = dots.filter(ImageFilter.GaussianBlur(2))
    # merge: take the brighter of glow / dots per pixel
    merged = ImageChops.lighter(glow, dots)
    out = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    out.putalpha(merged)
    out.save(OUT / "potency-glow.png")
    print("potency-glow.png", out.size)


if __name__ == "__main__":
    make_purity()
    make_stability()
    make_potency()
    print("done ->", OUT)
