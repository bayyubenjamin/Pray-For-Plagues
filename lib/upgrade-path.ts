import { RARITY_SPECS } from "./protocol";
import type { Rarity } from "./types";

/**
 * The upgrade model: a vial's TIER never changes — it is fixed at mint by
 * the token id range (COMMON 1-1100, RARE 1101-1600, EPIC 1601-1850,
 * LEGENDARY 1851-1970, MYTHIC 1971-2000). What the Lab upgrades is the
 * vial's RARITY: its three stats (purity, stability, potency), level by
 * level, inside its own tier. A Common stays Common — but it can become
 * the rarest Common. That is what OpenSea's rarity ranking reads: the
 * traits in the metadata, and the vial image is composited from layers
 * (see lib/vial-layers.ts) so the picture changes with the stats.
 *
 * Each stat has levels 0-5. One upgrade raises one stat by one level
 * (+STAT_STEP to its value, capped at STAT_CAP). The cost of one stat
 * level is NOT set here: it is null until the Lab contract publishes it
 * (the contract is the only authority for costs). The UI shows TBA for a
 * null cost and never invents a number.
 */
export type UpgradeStatId = "purity" | "stability" | "potency";

export const UPGRADE_STATS: { id: UpgradeStatId; label: string; blurb: string }[] = [
  { id: "purity", label: "PURITY", blurb: "How clear the fluid is. Low purity reads murky." },
  { id: "stability", label: "STABILITY", blurb: "How sound the glass is. Low stability reads cracked." },
  { id: "potency", label: "POTENCY", blurb: "How strong the dose is. High potency reads as glow." },
];

/** Value gained per level. */
export const STAT_STEP = 5;
/** Highest level a stat can reach. */
export const MAX_STAT_LEVEL = 5;
/** A stat value never exceeds 100. */
export const STAT_CAP = 100;

/** The value of a stat at a level: base + level * step, capped at 100. */
export function statValue(base: number, level: number): number {
  return Math.min(STAT_CAP, base + level * STAT_STEP);
}

/** Rarity score: the sum of the three stat values. Higher = rarer inside the tier. */
export function rarityScore(stats: { purity: number; stability: number; potency: number }): number {
  return stats.purity + stats.stability + stats.potency;
}

/** Cost of ONE stat level — null until the Lab contract sets it. */
export const STAT_UPGRADE_COST: { plaguesCost: number | null; pointsCost: number | null } = {
  plaguesCost: null,
  pointsCost: null,
};

/** Index of a stat in the Lab contract's upgrade(tokenId, stat) call. */
export const STAT_INDEX: Record<UpgradeStatId, number> = {
  purity: 0,
  stability: 1,
  potency: 2,
};

/** Which rarity a token id belongs to, from the fixed token ranges. */
export function rarityOfTokenId(tokenId: number): Rarity | null {
  return RARITY_SPECS.find((s) => tokenId >= s.min && tokenId <= s.max)?.rarity ?? null;
}

/** Owned token ids grouped by rarity, e.g. { COMMON: [42, 87] }. */
export function groupOwnedByRarity(tokenIds: number[]): Partial<Record<Rarity, number[]>> {
  const out: Partial<Record<Rarity, number[]>> = {};
  for (const id of tokenIds) {
    const rarity = rarityOfTokenId(id);
    if (!rarity) continue;
    (out[rarity] ??= []).push(id);
  }
  return out;
}
