"use client";
import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import { MOCK_NFTS } from "@/lib/mockData";
import { useState } from "react";

const FILTERS = ["ALL", "COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];
const SORTS = ["RARITY", "LEVEL", "PURITY", "POTENCY"];

export default function InventoryPage() {
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("RARITY");

  // Filtering and Sorting logic
  let displayedNFTs = [...MOCK_NFTS];
  
  if (filter !== "ALL") {
    displayedNFTs = displayedNFTs.filter(n => n.rarity === filter);
  }

  displayedNFTs.sort((a, b) => {
    switch (sort) {
      case "LEVEL": return b.level - a.level;
      case "PURITY": return b.purity - a.purity;
      case "POTENCY": return b.potency - a.potency;
      case "RARITY":
      default:
        const r = { MYTHIC: 5, LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
        return r[b.rarity] - r[a.rarity];
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SectionTitle title="ANTIDOTE INVENTORY" subtitle="YOUR ANTIDOTES" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-green/20 pb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-tech text-xs tracking-widest uppercase transition-colors ${
                filter === f ? "bg-green text-black" : "border border-green/30 text-gray hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 font-tech text-sm">
          <span className="text-gray uppercase tracking-widest">SORT BY:</span>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="bg-black border border-green/50 text-white px-4 py-2 outline-none focus:border-green cursor-pointer uppercase tracking-widest"
          >
            {SORTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedNFTs.map(nft => (
          <AntidoteCard 
            key={nft.id} 
            nft={nft} 
            actionLabel="UPGRADE"
            onClick={() => window.location.href = `/upgrade?id=${nft.id}`}
          />
        ))}
      </div>
      
      {displayedNFTs.length === 0 && (
        <div className="text-center py-20 font-tech text-gray tracking-widest">
          NO ANTIDOTES FOUND MATCHING CRITERIA.
        </div>
      )}
    </div>
  );
}
