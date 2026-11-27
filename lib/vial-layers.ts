import type { Rarity } from "./types";

/**
 * Layered vial images. The final picture of a vial is its rarity base
 * image plus three stat overlays, composited at the vial's stat values:
 *
 * - purity-murk.png   over the liquid, darker the lower the purity
 * - stability-cracks.png on the glass, stronger the lower the stability
 * - potency-glow.png  tinted with the rarity colour, screen-blended,
 *                     stronger the higher the potency
 *
 * One overlay set serves all five rarities (the files are identical for
 * every vial); only the glow colour differs per rarity. The overlays are
 * served from public/images/vials/layers/ so the Lab preview can draw
 * them on a canvas (see components/VialPreview.tsx). The same files are
 * the source for the off-chain image pipeline — see
 * assets/nft/layers/LAYERS.md and assets/nft/scripts/composite-vial.py.
 */
export type VialStats = {
  purity: number;
  stability: number;
  potency: number;
};

export const LAYER_URLS = {
  murk: "/images/vials/layers/purity-murk.png",
  cracks: "/images/vials/layers/stability-cracks.png",
  glow: "/images/vials/layers/potency-glow.png",
} as const;

export const RARITY_GLOW_COLORS: Record<Rarity, string> = {
  COMMON: "#22C55E",
  RARE: "#3B82F6",
  EPIC: "#A855F7",
  LEGENDARY: "#EAB308",
  MYTHIC: "#EF4444",
};

/** Murk opacity from a purity value (0..1). Purity 100 → invisible. */
export function murkAlpha(purity: number): number {
  return Math.min(1, Math.max(0, (100 - purity) / 100));
}

/** Cracks opacity from a stability value (0..1). Stability 100 → invisible. */
export function cracksAlpha(stability: number): number {
  return Math.min(1, Math.max(0, (100 - stability) / 100));
}

/** Glow screen-blend strength from a potency value (0..0.8). Potency 0 → none. */
export function glowStrength(potency: number): number {
  return Math.min(1, Math.max(0, potency / 100)) * 0.8;
}
