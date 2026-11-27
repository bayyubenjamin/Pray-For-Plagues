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
    blurb: "Hold a vial, then raise its rarity here — purity, stability and potency, paid in $PLAGUES + points. Contracts are not live.",
  },
  {
    id: 4,
    code: "CURE",
    status: "LOCKED",
    title: "$PLAGUES",
    blurb: "Extract is planned from a vial you own. Token is not deployed.",
  },
  {
    id: 5,
    code: "PANDEMIC",
    status: "LOCKED",
    title: "VAULT",
    blurb: "A later wallet-per-vial layer. Not specified yet.",
  },
];

export type RaritySpec = {
  rarity: Rarity;
  supply: number;
  dose: string;
  line: string;
  perk: string;
  // Token ID range on the 2,000-vial collection (matches the OpenSea metadata).
  range: string;
  // Numeric bounds of the same range — used to map an owned token id to
  // its rarity (e.g. token #42 is COMMON, #1500 is RARE).
  min: number;
  max: number;
  // Web-optimized vial art served from public/ (640×960 JPG).
  // Masters for OpenSea/IPFS live in assets/nft/images/.
  image: string;
};

export const RARITY_SPECS: RaritySpec[] = [
  { rarity: "COMMON", supply: 1100, dose: "1–2", line: "The standard-issue vial. The backbone of the outbreak.", perk: "Steady extract yield.", range: "#1–1100", min: 1, max: 1100, image: "/images/vials/common.jpg" },
  { rarity: "RARE", supply: 500, dose: "2–3", line: "Reinforced glass, stronger strain.", perk: "Higher purity baseline.", range: "#1101–1600", min: 1101, max: 1600, image: "/images/vials/rare.jpg" },
  { rarity: "EPIC", supply: 250, dose: "3–4", line: "A low-supply band for serious collectors.", perk: "Strong potency curve.", range: "#1601–1850", min: 1601, max: 1850, image: "/images/vials/epic.jpg" },
  { rarity: "LEGENDARY", supply: 120, dose: "4–5", line: "Scarce. Handwritten label, gold seal.", perk: "Near-peak stats across the board.", range: "#1851–1970", min: 1851, max: 1970, image: "/images/vials/legendary.jpg" },
  { rarity: "MYTHIC", supply: 30, dose: "5+", line: "Thirty vials only. The rarest strain in the lab.", perk: "Maximum purity and potency.", range: "#1971–2000", min: 1971, max: 2000, image: "/images/vials/mythic.jpg" },
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
