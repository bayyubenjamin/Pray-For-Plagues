import { RARITY_SPECS } from "./protocol";
import type { Rarity } from "./types";

/**
 * The upgrade ladder: a held vial climbs one tier at a time,
 * COMMON → RARE → EPIC → LEGENDARY → MYTHIC.
 *
 * Each step costs $PLAGUES + waitlist points — that is the ecosystem loop:
 * extract $PLAGUES from a vial you own, earn points on Task, spend both to
 * climb a tier. The amounts are NOT set here: they are null until the Lab
 * contract publishes them (the contract is the only authority for costs).
 * The UI shows TBA for a null cost and never invents a number.
 */
export type UpgradeStep = {
  from: Rarity;
  to: Rarity;
  /** $PLAGUES cost — null until the Lab contract sets it. */
  plaguesCost: number | null;
  /** Waitlist points cost — null until the Lab contract sets it. */
  pointsCost: number | null;
};

export const UPGRADE_PATH: UpgradeStep[] = [
  { from: "COMMON", to: "RARE", plaguesCost: null, pointsCost: null },
  { from: "RARE", to: "EPIC", plaguesCost: null, pointsCost: null },
  { from: "EPIC", to: "LEGENDARY", plaguesCost: null, pointsCost: null },
  { from: "LEGENDARY", to: "MYTHIC", plaguesCost: null, pointsCost: null },
];

/** The next tier up from a rarity, or null at the top (MYTHIC). */
export function nextTier(rarity: Rarity): UpgradeStep | null {
  return UPGRADE_PATH.find((s) => s.from === rarity) ?? null;
}

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
