"use client";

import SectionTitle from "@/components/SectionTitle";

export default function UpgradePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <SectionTitle title="LAB" subtitle="SOON" />
      <div className="mt-10 bg-deep/80 panel-border p-6 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="w-24 h-36 border-4 border-green/60 rounded-t-xl rounded-b-lg relative flex items-center justify-center shadow-[0_0_40px_rgba(0,200,5,0.3)] bg-darkGreen blur-sm opacity-40">
          <div className="absolute -top-3 w-10 h-3 bg-gray rounded-sm" />
          <span className="font-bangers text-xl text-green rotate-90 tracking-widest">PFP</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="font-bangers text-5xl text-green text-aura tracking-widest">SOON</p>
        </div>
        <button type="button" disabled className="w-full py-4 font-tech tracking-[0.2em] uppercase bg-green/30 text-black cursor-not-allowed opacity-50">
          UPGRADE
        </button>
      </div>
    </div>
  );
}
