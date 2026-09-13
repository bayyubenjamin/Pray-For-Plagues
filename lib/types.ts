export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

export interface AntidoteNFT {
  id: number;
  rarity: Rarity;
  level: number;
  purity: number;
  stability: number;
  potency: number;
  dose: number;
  vial: string;
  liquid: string;
  cap: string;
  label: string;
  symbol: string;
  aura: string;
}

export interface StatProps {
  label: string;
  value: string;
  subValue?: string;
}

export interface WaitlistEntry {
  id?: string;
  email: string;
  wallet?: string | null;
  created_at?: string;
}

export interface UserProfile {
  id?: string;
  wallet: string;
  display_name?: string | null;
  email?: string | null;
}
