import type { Rarity } from "./types";

export const SUPPLY = 2000;
export const OPENSEA_MINT = "https://opensea.io";

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
    blurb: "On this site. Connect X, join the list, climb rank for the OpenSea window.",
  },
  {
    id: 1,
    code: "ISOLATION",
    status: "NEXT",
    title: "SNAPSHOT",
    blurb: "Waitlist rank freezes. That list is for OpenSea mint access, not this dApp.",
  },
  {
    id: 2,
    code: "OUTBREAK",
    status: "LOCKED",
    title: "MINT ON OPENSEA",
    blurb: "2,000 vials mint on OpenSea. This dApp never mints.",
  },
  {
    id: 3,
    code: "MUTATION",
    status: "LOCKED",
    title: "LAB",
    blurb: "Hold a vial, then mutate it here. Purity, stability, potency.",
  },
  {
    id: 4,
    code: "CURE",
    status: "LOCKED",
    title: "$PLAGUES",
    blurb: "Extract $PLAGUES from a vial you own. Inventory only.",
  },
  {
    id: 5,
    code: "PANDEMIC",
    status: "LOCKED",
    title: "VAULT",
    blurb: "Each owned vial can hold $PLAGUES, ETH, later stock tokens.",
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
    perk: "Base $PLAGUES extract. Can mutate in the Lab.",
  },
  {
    rarity: "RARE",
    supply: 500,
    dose: "2–3",
    line: "Holds under pressure.",
    perk: "Higher extract multiplier.",
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
    perk: "Vault boost on the vial you hold.",
  },
  {
    rarity: "MYTHIC",
    supply: 30,
    dose: "5+",
    line: "The lab answers to you.",
    perk: "Highest extract multiplier. Corrupted aura.",
  },
];

export type AllowlistClassId = "PATIENT_ZERO" | "QUARANTINE" | "PUBLIC" | "UNLISTED";

export type AllowlistClass = {
  id: AllowlistClassId;
  label: string;
  window: string;
  hint: string;
};

export const ALLOWLIST_CLASSES: Record<AllowlistClassId, AllowlistClass> = {
  PATIENT_ZERO: {
    id: "PATIENT_ZERO",
    label: "PATIENT ZERO",
    window: "OPENSEA — FIRST WINDOW",
    hint: "Top 50 waitlist rank. First OpenSea mint window.",
  },
  QUARANTINE: {
    id: "QUARANTINE",
    label: "QUARANTINE",
    window: "OPENSEA — GTD",
    hint: "Rank 51–250. Guaranteed OpenSea window before public.",
  },
  PUBLIC: {
    id: "PUBLIC",
    label: "PUBLIC",
    window: "OPENSEA — FCFS",
    hint: "On the list. Public OpenSea mint.",
  },
  UNLISTED: {
    id: "UNLISTED",
    label: "UNLISTED",
    window: "NO OPENSEA SLOT",
    hint: "Join the waitlist on Task. Inventory stays separate.",
  },
};

export function allowlistClassFromRank(rank: number | null, joined: boolean): AllowlistClass {
  if (!joined || !rank) return ALLOWLIST_CLASSES.UNLISTED;
  if (rank <= 50) return ALLOWLIST_CLASSES.PATIENT_ZERO;
  if (rank <= 250) return ALLOWLIST_CLASSES.QUARANTINE;
  return ALLOWLIST_CLASSES.PUBLIC;
}
