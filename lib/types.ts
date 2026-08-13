export interface AntidoteNFT {
  id: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
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
