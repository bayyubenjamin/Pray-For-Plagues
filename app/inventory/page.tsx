"use client";
import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import { MOCK_NFTS } from "@/lib/mockData";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FILTERS = ["ALL", "MYTHIC", "LEGENDARY", "EPIC", "RARE", "COMMON"];

export default function InventoryPage() {
  const [filter, setFilter] = useState("ALL");
  const router = useRouter();
  const list = MOCK_NFTS.filter((n) => filter === "ALL" || n.rarity === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <SectionTitle title="INVENTORY" subtitle="YOUR VIALS" />
      <div className="flex flex-wrap gap-2 my-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 font-tech text-[10px] tracking-widest uppercase ${
              filter === f ? "bg-green text-black" : "border border-green/30 text-gray"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((nft) => (
          <AntidoteCard
            key={nft.id}
            nft={nft}
            compact
            actionLabel="LAB"
            onClick={() => router.push(`/upgrade?id=${nft.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
