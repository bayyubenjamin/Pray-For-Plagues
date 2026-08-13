import { AntidoteNFT } from "./types";

export const MOCK_NFTS: AntidoteNFT[] = [
  { id: 1842, rarity: "COMMON", level: 1, purity: 32.4, stability: 61.8, potency: 42.7, dose: 1, vial: "Standard Vial", liquid: "Green Fluid", cap: "Metal Cap", label: "Standard", symbol: "Biohazard", aura: "None" },
  { id: 371, rarity: "RARE", level: 2, purity: 55.0, stability: 70.1, potency: 60.5, dose: 2, vial: "Reinforced Vial", liquid: "Blue Fluid", cap: "Black Cap", label: "Biohazard", symbol: "Eye", aura: "Smoke" },
  { id: 921, rarity: "EPIC", level: 4, purity: 78.2, stability: 82.5, potency: 85.0, dose: 3, vial: "Dark Vial", liquid: "Purple Fluid", cap: "Bone Cap", label: "Classified", symbol: "Plague Cross", aura: "Particles" },
  { id: 1288, rarity: "LEGENDARY", level: 6, purity: 92.1, stability: 89.4, potency: 94.2, dose: 4, vial: "Ancient Vial", liquid: "Gold Fluid", cap: "Gold Cap", label: "Handwritten", symbol: "DNA", aura: "Energy" },
  { id: 555, rarity: "MYTHIC", level: 7, purity: 98.9, stability: 99.1, potency: 97.5, dose: 5, vial: "Cracked Vial", liquid: "Red Fluid", cap: "Rusted Cap", label: "Worn Out", symbol: "None", aura: "Corrupted" },
  { id: 204, rarity: "COMMON", level: 1, purity: 40.1, stability: 50.2, potency: 38.9, dose: 1, vial: "Standard Vial", liquid: "Green Fluid", cap: "Metal Cap", label: "Standard", symbol: "None", aura: "None" },
  { id: 1102, rarity: "COMMON", level: 2, purity: 45.5, stability: 55.8, potency: 49.2, dose: 1, vial: "Standard Vial", liquid: "Green Fluid", cap: "Rusted Cap", label: "Worn Out", symbol: "Biohazard", aura: "None" },
  { id: 89, rarity: "RARE", level: 3, purity: 68.4, stability: 62.1, potency: 71.0, dose: 2, vial: "Reinforced Vial", liquid: "Purple Fluid", cap: "Metal Cap", label: "Biohazard", symbol: "DNA", aura: "Smoke" },
  { id: 743, rarity: "EPIC", level: 5, purity: 85.6, stability: 88.9, potency: 82.3, dose: 3, vial: "Dark Vial", liquid: "Red Fluid", cap: "Black Cap", label: "Classified", symbol: "Plague Cross", aura: "Energy" },
  { id: 1999, rarity: "LEGENDARY", level: 6, purity: 91.5, stability: 93.2, potency: 90.8, dose: 4, vial: "Ancient Vial", liquid: "Blue Fluid", cap: "Gold Cap", label: "Handwritten", symbol: "Eye", aura: "Particles" },
  { id: 42, rarity: "RARE", level: 3, purity: 62.8, stability: 75.4, potency: 68.9, dose: 2, vial: "Reinforced Vial", liquid: "Gold Fluid", cap: "Black Cap", label: "Standard", symbol: "Biohazard", aura: "None" },
  { id: 1666, rarity: "COMMON", level: 1, purity: 29.9, stability: 45.6, potency: 35.1, dose: 1, vial: "Cracked Vial", liquid: "Green Fluid", cap: "Rusted Cap", label: "Worn Out", symbol: "None", aura: "None" },
];

export const MOCK_STATS = [
  { label: "ANTIDOTES", value: "2,000" },
  { label: "HOLDERS", value: "667" },
  { label: "TRANSACTIONS", value: "13.4K" },
  { label: "UTILITY TOKEN", value: "$PLAGUES" },
];

export const LEADERBOARD_DATA = MOCK_NFTS.sort((a, b) => (b.purity + b.potency) - (a.purity + a.potency)).map((nft, index) => ({
  rank: index + 1,
  id: nft.id,
  score: Math.floor((nft.purity + nft.potency + nft.stability) * 10 * nft.level),
  level: nft.level,
}));
