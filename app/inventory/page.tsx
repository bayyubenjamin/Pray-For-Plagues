"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";
import ConnectWallet from "@/components/ConnectWallet";
import { OPENSEA_MINT, RARITY_SPECS } from "@/lib/protocol";
import { formatAddress } from "@/lib/utils";

type Tab = "VIALS" | "EXTRACT" | "LAB";

export default function InventoryPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("VIALS");
  const owned: never[] = [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="INVENTORY" subtitle="UTILITY FOR VIALS YOU HOLD" />

      <p className="max-w-2xl mx-auto mb-8 text-center font-tech text-[11px] sm:text-xs tracking-widest text-gray leading-relaxed">
        Mint lives on OpenSea. This page only reads vials in the connected wallet, then unlocks extract and mutation.
      </p>

      <div className="max-w-xl mx-auto mb-8">
        <PanelCard title="CONNECTED WALLET">
          <p className="font-tech text-sm tracking-widest text-green">
            {isConnected && address ? formatAddress(address) : "NOT CONNECTED"}
          </p>
          <p className="mt-2 font-tech text-[10px] tracking-widest text-gray">
            {owned.length} VIAL{owned.length === 1 ? "" : "S"} IN WALLET
          </p>
          <div className="mt-4">
            <ConnectWallet />
          </div>
        </PanelCard>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(["VIALS", "EXTRACT", "LAB"] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-2 font-tech text-[10px] tracking-widest uppercase border ${
              tab === item ? "bg-green text-black border-green" : "border-green/30 text-gray hover:text-green"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "VIALS" && (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <PanelCard className="text-center">
            <p className="font-bangers text-4xl text-green text-aura tracking-widest">NO VIALS</p>
            <p className="mt-4 font-tech text-[11px] leading-relaxed text-gray">
              Inventory is empty until a Pray For Plagues vial sits in this wallet. Buy or mint on OpenSea, then come back to use it.
            </p>
            <a
              href={OPENSEA_MINT}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-6 px-6 py-3 bg-green text-black font-tech text-xs tracking-widest hover:bg-green-bright"
            >
              MINT ON OPENSEA
            </a>
          </PanelCard>
          <PanelCard title="WHAT A HELD VIAL UNLOCKS">
            <ul className="flex flex-col gap-3">
              {RARITY_SPECS.map((spec) => (
                <li key={spec.rarity} className="border border-green/15 p-3">
                  <p className="font-tech text-[10px] tracking-widest text-green">{spec.rarity}</p>
                  <p className="mt-1 font-tech text-[11px] text-gray leading-relaxed">{spec.perk}</p>
                </li>
              ))}
            </ul>
          </PanelCard>
        </div>
      )}

      {tab === "EXTRACT" && (
        <div className="max-w-xl mx-auto">
          <PanelCard className="text-center">
            <p className="font-tech text-[10px] tracking-widest text-gray">CURE PROTOCOL</p>
            <h3 className="mt-3 font-bangers text-5xl text-green text-aura tracking-widest">$PLAGUES</h3>
            <p className="mt-4 font-tech text-[11px] leading-relaxed text-gray">
              Extract is tied to a vial in this wallet. No vial, no claim. Waitlist points do not mint or extract tokens here.
            </p>
            <button type="button" disabled className="mt-6 w-full py-4 font-tech tracking-[0.2em] uppercase bg-green/30 text-black cursor-not-allowed opacity-50">
              EXTRACT SEALED
            </button>
          </PanelCard>
        </div>
      )}

      {tab === "LAB" && (
        <div className="max-w-xl mx-auto text-center">
          <PanelCard>
            <p className="font-bangers text-4xl text-green text-aura tracking-widest">MUTATION</p>
            <p className="mt-4 font-tech text-[11px] leading-relaxed text-gray">
              Lab upgrades the vial you hold: dose, rarity, purity, stability, potency. Select a vial from Inventory after you own one.
            </p>
            <Link href="/upgrade" className="inline-block mt-6 px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen">
              OPEN LAB
            </Link>
          </PanelCard>
        </div>
      )}
    </div>
  );
}
