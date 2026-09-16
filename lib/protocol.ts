import type { Rarity } from "./types";

export const SUPPLY = 2000;

export type PhaseStatus = "LIVE" | "NEXT" | "LOCKED";

export type Phase = {
  id: number;
  code: string;
  status: PhaseStatus;
  title: string;
  blurb: string;
};

export const PHASES: Phase[] = [
  {
    id: 0,
    code: "CONTAGION",
    status: "LIVE",
    title: "WAITLIST",
    blurb: "Connect X. Join the list. Tasks and referrals compound your dose.",
  },
  {
    id: 1,
    code: "ISOLATION",
    status: "NEXT",
    title: "SNAPSHOT",
    blurb: "Rank freezes into a mint class. Patient Zero. Quarantine. Public.",
  },
  {
    id: 2,
    code: "OUTBREAK",
    status: "LOCKED",
    title: "MINT",
    blurb: "2,000 Antidote vials open. Your class decides who extracts first.",
  },
  {
    id: 3,
    code: "MUTATION",
    status: "LOCKED",
    title: "LAB",
    blurb: "Upgrade dose. Mutate rarity. Purity, stability, and potency move.",
  },
  {
    id: 4,
    code: "CURE",
    status: "LOCKED",
    title: "$PLAGUES",
    blurb: "Claim unlocks only after Outbreak. Living vials earn the token.",
  },
  {
    id: 5,
    code: "PANDEMIC",
    status: "LOCKED",
    title: "VAULT",
    blurb: "Each vial carries its own vault. $PLAGUES, ETH, later stock tokens.",
  },
];

export type RaritySpec = {
  rarity: Rarity;
  supply: number;
  dose: string;
  line: string;
  perk: string;
};

export const RARITY_SPECS: RaritySpec[] = [
  {
    rarity: "COMMON",
    supply: 1100,
    dose: "1–2",
    line: "Survives the first wave.",
    perk: "Base $PLAGUES earn. Can mutate in the Lab.",
  },
  {
    rarity: "RARE",
    supply: 500,
    dose: "2–3",
    line: "Holds under pressure.",
    perk: "Higher earn multiplier. Wave-2 task access.",
  },
  {
    rarity: "EPIC",
    supply: 250,
    dose: "3–4",
    line: "The lab notices you.",
    perk: "Priority Lab slot. Chance to mutate upward.",
  },
  {
    rarity: "LEGENDARY",
    supply: 120,
    dose: "4–5",
    line: "The cap does not leak.",
    perk: "Vault boost. Heavier weight in token snapshot.",
  },
  {
    rarity: "MYTHIC",
    supply: 30,
    dose: "5+",
    line: "The lab answers to you.",
    perk: "Patient Zero rights. Highest multiplier. Corrupted aura.",
  },
];

export type MintClassId = "PATIENT_ZERO" | "QUARANTINE" | "PUBLIC" | "UNLISTED";

export type MintClass = {
  id: MintClassId;
  label: string;
  window: string;
  hint: string;
};

export const MINT_CLASSES: Record<MintClassId, MintClass> = {
  PATIENT_ZERO: {
    id: "PATIENT_ZERO",
    label: "PATIENT ZERO",
    window: "FIRST EXTRACTION",
    hint: "Top 50 rank. Earliest mint window. Heaviest dose weight.",
  },
  QUARANTINE: {
    id: "QUARANTINE",
    label: "QUARANTINE",
    window: "GTD MINT",
    hint: "Rank 51–250. Guaranteed extraction before public.",
  },
  PUBLIC: {
    id: "PUBLIC",
    label: "PUBLIC",
    window: "FCFS",
    hint: "On the list. Points still compound dose after Isolation.",
  },
  UNLISTED: {
    id: "UNLISTED",
    label: "UNLISTED",
    window: "NO SLOT",
    hint: "Join the waitlist to start compounding a dose.",
  },
};

export function mintClassFromRank(rank: number | null, joined: boolean): MintClass {
  if (!joined || !rank) return MINT_CLASSES.UNLISTED;
  if (rank <= 50) return MINT_CLASSES.PATIENT_ZERO;
  if (rank <= 250) return MINT_CLASSES.QUARANTINE;
  return MINT_CLASSES.PUBLIC;
}

export function purityFromPoints(points: number) {
  return Math.min(99.9, Math.round((points / 12) * 10) / 10);
}

export function doseProgress(points: number) {
  return Math.min(100, Math.floor(points / 8));
}
