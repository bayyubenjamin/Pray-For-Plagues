"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AntidoteCard from "@/components/AntidoteCard";
import ScrollReveal from "@/components/ScrollReveal";
import { STRAIN_PREVIEW } from "@/lib/mockData";
import { AntidoteNFT } from "@/lib/types";

// Loaded on demand only — the modal chunk stays out of the home first load.
const NftDetailModal = dynamic(() => import("@/components/NftDetailModal"), { ssr: false });

export default function NftPreviewGrid() {
  const [selected, setSelected] = useState<AntidoteNFT | null>(null);
  // One preview card per rarity, Common first — every vial art is shown.
  const previewNFTs = (["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const).map(
    (rarity) => STRAIN_PREVIEW.find((n) => n.rarity === rarity)!
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {previewNFTs.map((nft, index) => (
          <ScrollReveal key={nft.id} delay={index * 100}>
            <AntidoteCard nft={nft} briefing onSelect={setSelected} />
          </ScrollReveal>
        ))}
      </div>
      <NftDetailModal nft={selected} onClose={() => setSelected(null)} />
    </>
  );
}
