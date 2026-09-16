"use client";

import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";

export default function UpgradePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <SectionTitle title="LAB" subtitle="MUTATE A VIAL YOU HOLD" />
      <PanelCard className="mt-10 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="w-24 h-36 border-4 border-green/60 rounded-t-xl rounded-b-lg relative flex items-center justify-center shadow-[0_0_40px_rgba(0,200,5,0.3)] bg-darkGreen opacity-40">
          <div className="absolute -top-3 w-10 h-3 bg-gray rounded-sm" />
          <span className="font-bangers text-xl text-green rotate-90 tracking-widest">PFP</span>
        </div>
        <div className="relative z-10 text-center px-4">
          <p className="font-bangers text-5xl text-green text-aura tracking-widest">NO VIAL</p>
          <p className="mt-4 font-tech text-[11px] leading-relaxed text-gray">
            Lab reads Inventory. Connect a wallet that holds a vial, pick it, then mutate dose and rarity. Mint stays on OpenSea.
          </p>
        </div>
        <button type="button" disabled className="w-full py-4 font-tech tracking-[0.2em] uppercase bg-green/30 text-black cursor-not-allowed opacity-50">
          MUTATE
        </button>
        <Link href="/inventory" className="font-tech text-[10px] tracking-widest text-green hover:text-green-bright">
          OPEN INVENTORY →
        </Link>
      </PanelCard>
    </div>
  );
}
