"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";
import ConnectWallet from "@/components/ConnectWallet";
import { OPENSEA_MINT, RARITY_SPECS, SUPPLY } from "@/lib/protocol";
import { formatAddress } from "@/lib/utils";

type Tab = "VIALS" | "EXTRACT" | "LAB";

export default function InventoryPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("VIALS");
  const ownedCount = 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="INVENTORY" subtitle="HELD VIALS ONLY" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
        <PanelCard title="WALLET" compact>
          <p className="font-tech text-sm text-green tracking-widest truncate">
            {isConnected && address ? formatAddress(address) : "—"}
          </p>
        </PanelCard>
        <PanelCard title="VIALS" compact>
          <p className="font-bangers text-3xl text-green text-aura leading-none">{ownedCount}</p>
        </PanelCard>
        <PanelCard title="NETWORK" compact>
          <p className="font-tech text-sm text-green tracking-widest">ROBINHOOD 4663</p>
        </PanelCard>
      </div>

      <div className="mb-8">
        <ConnectWallet />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
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
        <div className="flex flex-col gap-6">
          <div className="card-panel overflow-hidden">
            <div className="grid md:grid-cols-[140px_1fr] gap-0">
              <div className="hidden md:flex items-center justify-center border-r border-green/15 bg-black/40 py-10">
                <div className="w-16 h-24 border-2 border-green/40 rounded-t-xl rounded-b-md relative flex items-center justify-center shadow-[0_0_24px_rgba(0,200,5,0.18)] bg-darkGreen">
                  <div className="absolute -top-2 w-8 h-2 bg-gray/70 rounded-sm" />
                  <span className="font-bangers text-[10px] text-green/80 rotate-90 tracking-widest">PFP</span>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <p className="font-tech text-[10px] tracking-[0.25em] text-gray">COLLECTION</p>
                <h3 className="mt-2 font-bangers text-3xl sm:text-4xl text-green tracking-wide">ANTIDOTE VIALS</h3>
                <p className="mt-4 max-w-xl font-tech text-[12px] leading-relaxed text-gray">
                  A vial is an NFT on Robinhood Chain. Inventory lists only tokens in the connected wallet. Mint and secondary sales stay on OpenSea. This page does not mint.
                </p>
                <div className="mt-6 flex flex-wrap gap-6">
                  <div>
                    <p className="font-tech text-[9px] tracking-widest text-gray">SUPPLY</p>
                    <p className="font-bangers text-2xl text-green leading-none mt-1">{SUPPLY.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-tech text-[9px] tracking-widest text-gray">IN THIS WALLET</p>
                    <p className="font-bangers text-2xl text-green leading-none mt-1">{ownedCount}</p>
                  </div>
                  <div>
                    <p className="font-tech text-[9px] tracking-widest text-gray">STATUS</p>
                    <p className="font-tech text-sm text-green tracking-widest mt-2">NOT MINTED</p>
                  </div>
                </div>
                <a
                  href={OPENSEA_MINT}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-8 px-6 py-3 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen"
                >
                  VIEW ON OPENSEA
                </a>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              {
                title: "HOLD",
                body: "The vial is the collectible. Traits and rarity live on the token after mint.",
              },
              {
                title: "EXTRACT",
                body: "$PLAGUES is planned to be claimed from a vial you own. The token is not live.",
              },
              {
                title: "MUTATE",
                body: "Lab is planned to change stats on a held vial. No upgrade path is live yet.",
              },
            ].map((item) => (
              <PanelCard key={item.title} title={item.title}>
                <p className="font-tech text-[12px] leading-relaxed text-gray">{item.body}</p>
              </PanelCard>
            ))}
          </div>

          <PanelCard title="RARITY BANDS">
            <p className="mb-4 font-tech text-[11px] leading-relaxed text-gray">
              Planned distribution for {SUPPLY.toLocaleString()} vials. Multipliers and Lab rules will be published with the contracts — not before.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-tech">
                <thead>
                  <tr className="border-y border-green/20 text-gray text-[10px] tracking-widest">
                    <th className="py-3 pr-4">TIER</th>
                    <th className="py-3 pr-4">COUNT</th>
                    <th className="py-3">NOTE</th>
                  </tr>
                </thead>
                <tbody>
                  {RARITY_SPECS.map((spec) => (
                    <tr key={spec.rarity} className="border-b border-green/10">
                      <td className="py-3 pr-4 text-green tracking-widest">{spec.rarity}</td>
                      <td className="py-3 pr-4 text-white">{spec.supply.toLocaleString()}</td>
                      <td className="py-3 text-gray">{spec.line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>

          <div className="border border-dashed border-green/20 px-6 py-14 text-center">
            <p className="font-tech text-[10px] tracking-[0.3em] text-gray">OWNED</p>
            <p className="mt-3 font-bangers text-3xl text-green tracking-wide">NO VIALS IN WALLET</p>
            <p className="mt-3 font-tech text-[11px] text-gray tracking-widest">CONNECT A WALLET THAT HOLDS ONE AFTER MINT</p>
          </div>
        </div>
      )}

      {tab === "EXTRACT" && (
        <div className="max-w-xl mx-auto">
          <PanelCard>
            <p className="font-tech text-[10px] tracking-widest text-gray">$PLAGUES</p>
            <h3 className="mt-3 font-bangers text-4xl text-green tracking-wide">EXTRACT</h3>
            <p className="mt-4 font-tech text-[12px] leading-relaxed text-gray">
              Extract will send $PLAGUES from a vial in this wallet. The token contract is not deployed. Waitlist points cannot extract.
            </p>
            <button type="button" disabled className="mt-6 w-full py-4 font-tech tracking-[0.2em] uppercase border border-green/20 text-gray cursor-not-allowed">
              NOT AVAILABLE
            </button>
          </PanelCard>
        </div>
      )}

      {tab === "LAB" && (
        <div className="max-w-xl mx-auto">
          <PanelCard>
            <p className="font-tech text-[10px] tracking-widest text-gray">MUTATION</p>
            <h3 className="mt-3 font-bangers text-4xl text-green tracking-wide">LAB</h3>
            <p className="mt-4 font-tech text-[12px] leading-relaxed text-gray">
              Lab will operate on a selected vial from Inventory. Stats (purity, stability, potency) are designed into the metadata. The upgrade contract is not live.
            </p>
            <Link href="/upgrade" className="inline-block mt-6 px-6 py-3 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen">
              OPEN LAB
            </Link>
          </PanelCard>
        </div>
      )}
    </div>
  );
}
