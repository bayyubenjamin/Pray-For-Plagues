"use client";

import { useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import NftDetailModal from "@/components/NftDetailModal";
import ScrollReveal from "@/components/ScrollReveal";
import EnterLabButton from "@/components/EnterLabButton";
import ProtocolRoadmap from "@/components/ProtocolRoadmap";
import { STRAIN_PREVIEW } from "@/lib/mockData";
import { OPENSEA_MINT } from "@/lib/protocol";
import { AntidoteNFT } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const [selected, setSelected] = useState<AntidoteNFT | null>(null);
  // One preview card per rarity, Common first — every vial art is shown.
  const previewNFTs = (["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const).map(
    (rarity) => STRAIN_PREVIEW.find((n) => n.rarity === rarity)!
  );

  return (
    <div className="flex flex-col items-center w-full">
      <section className="w-full min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <ScrollReveal className="text-center max-w-4xl mx-auto z-20 flex flex-col items-center gap-4 sm:gap-6 mt-16 sm:mt-0">
          <h1 className="animate-hero-rise font-bangers text-5xl sm:text-7xl md:text-[5.5rem] text-green tracking-wider text-aura leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            PRAY FOR PLAGUES
          </h1>
          <p className="font-tech text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase max-w-2xl px-4 sm:px-6 py-2 card-panel border border-green/30 box-aura">
            THE PLAGUE HAS ARRIVED ON <span className="text-green font-bold">ROBINHOOD</span> CHAIN.
          </p>
          <p className="font-tech text-xs sm:text-sm tracking-[0.2em] text-zinc-300 uppercase">
            Mint on OpenSea. Use the vial here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 w-full sm:w-auto px-6 sm:px-0">
            <EnterLabButton className="px-8 sm:px-10 py-3.5 sm:py-4 bg-green text-black font-tech font-bold text-sm sm:text-lg tracking-[0.2em] hover:bg-green-bright transition-colors uppercase text-center box-aura" />
            <Link
              href="/inventory"
              className="px-8 sm:px-10 py-3.5 sm:py-4 card-panel border border-green text-green font-tech font-bold text-sm sm:text-lg tracking-[0.2em] hover:bg-darkGreen transition-colors uppercase text-center box-aura"
            >
              INVENTORY
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section className="cv-auto w-full max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <ScrollReveal>
          <SectionTitle title="OUTBREAK PROTOCOL" subtitle="MINT ON OPENSEA · UTILITY ON THIS LAB" />
        </ScrollReveal>
        <ScrollReveal>
          <ProtocolRoadmap />
        </ScrollReveal>
        <div className="text-center mt-8">
          <a href={OPENSEA_MINT} target="_blank" rel="noreferrer" className="font-tech text-xs tracking-widest text-green hover:text-green-bright underline underline-offset-4 decoration-green/40">
            OPENSEA MINT
          </a>
        </div>
      </section>

      <section className="cv-auto w-full max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <ScrollReveal>
          <SectionTitle title="ANTIDOTE UTILITY" subtitle="WHAT A HELD VIAL DOES" />
        </ScrollReveal>
        <p className="text-center font-tech text-xs tracking-[0.25em] text-zinc-300 uppercase">
          Strain preview — illustrative stats only · Real stats come after mint
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {previewNFTs.map((nft, index) => (
            <ScrollReveal key={nft.id} delay={index * 100}>
              <AntidoteCard nft={nft} briefing onSelect={setSelected} />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/inventory" className="font-tech text-xs tracking-widest text-green hover:text-green-bright underline underline-offset-4 decoration-green/40">
            OPEN INVENTORY
          </Link>
        </div>
        <NftDetailModal nft={selected} onClose={() => setSelected(null)} />
      </section>
    </div>
  );
}
