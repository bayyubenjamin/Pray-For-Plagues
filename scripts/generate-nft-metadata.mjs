// Generate 2,000 per-token OpenSea metadata files from the 5 rarity templates.
// No dependencies. Deterministic: same input always gives the same output.
// Usage:
//   1. Upload assets/nft/images/*.png to IPFS, note the CID.
//   2. node scripts/generate-nft-metadata.mjs --cid <CID> [--out assets/nft/generated]
//   3. Upload the generated folder to IPFS and set it as the contract baseURI.
// Token IDs 1-2000, in rarity order: Common 1-1100, Rare 1101-1600,
// Epic 1601-1850, Legendary 1851-1970, Mythic 1971-2000.
// Purity / Stability / Potency are deterministic pseudo-random values in the
// range of each rarity (seeded by token id), so traits are fixed before mint.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const cidIdx = args.indexOf("--cid");
const outIdx = args.indexOf("--out");
if (cidIdx === -1 || !args[cidIdx + 1]) {
  console.error("Usage: node scripts/generate-nft-metadata.mjs --cid <IPFS_CID> [--out <dir>]");
  process.exit(1);
}
const cid = args[cidIdx + 1];
const outDir = join(root, outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : "assets/nft/generated");

// Deterministic PRNG (mulberry32), seeded per token id.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RARITIES = [
  { key: "common", rarity: "COMMON", supply: 1100, dose: "1-2", vial: "Standard Vial", liquid: "Green Fluid", cap: "Metal Cap", label: "Standard", symbol: "Biohazard", aura: "None", stat: [30, 50] },
  { key: "rare", rarity: "RARE", supply: 500, dose: "2-3", vial: "Reinforced Vial", liquid: "Blue Fluid", cap: "Black Cap", label: "Biohazard", symbol: "Eye", aura: "Smoke", stat: [50, 70] },
  { key: "epic", rarity: "EPIC", supply: 250, dose: "3-4", vial: "Dark Vial", liquid: "Purple Fluid", cap: "Bone Cap", label: "Classified", symbol: "Plague Cross", aura: "Particles", stat: [70, 85] },
  { key: "legendary", rarity: "LEGENDARY", supply: 120, dose: "4-5", vial: "Ancient Vial", liquid: "Gold Fluid", cap: "Gold Cap", label: "Handwritten", symbol: "DNA", aura: "Energy", stat: [85, 95] },
  { key: "mythic", rarity: "MYTHIC", supply: 30, dose: "5+", vial: "Cracked Vial", liquid: "Red Fluid", cap: "Rusted Cap", label: "Worn Out", symbol: "None", aura: "Corrupted", stat: [95, 99] },
];

function statInRange(rand, [lo, hi]) {
  return Math.round((lo + rand() * (hi - lo)) * 10) / 10;
}

mkdirSync(outDir, { recursive: true });
let id = 0;
const counts = {};
for (const r of RARITIES) {
  const template = JSON.parse(readFileSync(join(root, "assets/nft/metadata", `${r.key}.json`), "utf8"));
  for (let n = 0; n < r.supply; n++) {
    id += 1;
    const rand = rng(id);
    const meta = {
      name: `Pray For Plagues #${id}`,
      description: template.description,
      external_url: "https://prayforplagues.xyz",
      image: `ipfs://${cid}/${r.key}.png`,
      attributes: [
        { trait_type: "Rarity", value: r.rarity },
        { trait_type: "Vial", value: r.vial },
        { trait_type: "Liquid", value: r.liquid },
        { trait_type: "Cap", value: r.cap },
        { trait_type: "Label", value: r.label },
        { trait_type: "Symbol", value: r.symbol },
        { trait_type: "Aura", value: r.aura },
        { trait_type: "Dose", value: r.dose },
        { display_type: "number", trait_type: "Purity", value: statInRange(rand, r.stat) },
        { display_type: "number", trait_type: "Stability", value: statInRange(rand, r.stat) },
        { display_type: "number", trait_type: "Potency", value: statInRange(rand, r.stat) },
      ],
    };
    writeFileSync(join(outDir, `${id}.json`), JSON.stringify(meta, null, 2) + "\n");
    counts[r.rarity] = (counts[r.rarity] || 0) + 1;
  }
}
console.log(`Wrote ${id} token files to ${outDir}`);
console.log(counts);
