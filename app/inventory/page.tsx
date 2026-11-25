"use client";

import { useState } from "react";
import Image from "next/image";
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
            className={`px-4 py-2 font-tech text-xs tracking-widest uppercase border ${
              tab === item ? "bg-green text-black border-green" : "border-green/30 text-zinc-400 hover:text-green"
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
              <div className="hidden md:block relative border-r border-green/15 bg-black/40 min-h-[220px]">
                <Image
                  src="/images/vials/common.jpg"
                  alt="Common antidote vial"
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8">
                <p className="font-tech text-xs tracking-[0.25em] text-zinc-300">COLLECTION</p>
                <h3 className="mt-2 font-bangers text-3xl sm:text-4xl text-green tracking-wide">ANTIDOTE VIALS</h3>
                <p className="mt-4 max-w-xl font-tech text-sm leading-relaxed text-zinc-300">
                  A vial is an NFT on Robinhood Chain. Inventory lists only tokens in the connected wallet. Mint and secondary sales stay on OpenSea. This page does not mint.
                </p>
                <div className="mt-6 flex flex-wrap gap-6">
                  <div>
                    <p className="font-tech text-[10px] tracking-widest text-zinc-300">SUPPLY</p>
                    <p className="font-bangers text-2xl text-green leading-none mt-1">{SUPPLY.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-tech text-[10px] tracking-widest text-zinc-300">IN THIS WALLET</p>
                    <p className="font-bangers text-2xl text-green leading-none mt-1">{ownedCount}</p>
                  </div>
                  <div>
                    <p className="font-tech text-[10px] tracking-widest text-zinc-300">STATUS</p>
                    <p className="font-tech text-sm text-green tracking-widest mt-2">NOT MINTED</p>
                  </div>
                </div>
                <a
                  href={OPENSEA_MINT}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-8 px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen"
                >
                  VIEW ON OPENSEA
                </a>
              </div>
            </div>
          </div>

          <div className="card-panel p-4 sm:p-6">
            <p className="font-tech text-xs tracking-[0.25em] text-zinc-300">THE FIVE STRAINS</p>
            <h3 className="mt-2 font-bangers text-2xl sm:text-3xl text-green tracking-wide">VIAL ART BY RARITY</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
              {RARITY_SPECS.map((spec) => (
                <div key={spec.rarity} className="border border-green/20 bg-black overflow-hidden">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={spec.image}
                      alt={`${spec.rarity} antidote vial`}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2 flex items-center justify-between gap-2">
                    <span className="font-tech text-[10px] tracking-widest text-green">{spec.rarity}</span>
                    <span className="font-tech text-[10px] tracking-widest text-zinc-300">{spec.supply.toLocaleString()}</span>
                  </div>
                </div>
              ))}
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
                <p className="font-tech text-sm leading-relaxed text-zinc-300">{item.body}</p>
              </PanelCard>
            ))}
          </div>

          <PanelCard title="RARITY BANDS">
            <p className="mb-4 font-tech text-sm leading-relaxed text-zinc-300">
              Planned distribution for {SUPPLY.toLocaleString()} vials. Multipliers and Lab rules will be published with the contracts — not before.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-tech text-sm">
                <thead>
                  <tr className="border-y border-green/20 text-zinc-300 text-xs tracking-widest">
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
                      <td className="py-3 text-zinc-400">{spec.line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>

          <div className="border border-dashed border-green/20 px-6 py-14 text-center">
            <p className="font-tech text-xs tracking-[0.3em] text-zinc-300">OWNED</p>
            <p className="mt-3 font-bangers text-3xl text-green tracking-wide">NO VIALS IN WALLET</p>
            <p className="mt-3 font-tech text-xs text-zinc-300 tracking-widest">CONNECT A WALLET THAT HOLDS ONE AFTER MINT</p>
            <p className="mt-2 font-tech text-xs text-zinc-300/70 tracking-widest">ON-CHAIN OWNERSHIP CHECK NOT LIVE YET — COUNT STAYS 0 UNTIL MINT</p>
          </div>
        </div>
      )}

      {tab === "EXTRACT" && (
        <div className="max-w-xl mx-auto">
          <PanelCard>
            <p className="font-tech text-xs tracking-widest text-zinc-300">$PLAGUES</p>
            <h3 className="mt-3 font-bangers text-4xl text-green tracking-wide">EXTRACT</h3>
            <p className="mt-4 font-tech text-sm leading-relaxed text-zinc-300">
              Extract will send $PLAGUES from a vial in this wallet. The token contract is not deployed. Waitlist points cannot extract.
            </p>
            <button type="button" disabled className="mt-6 w-full py-4 font-tech tracking-[0.2em] uppercase border border-green/20 text-zinc-400 cursor-not-allowed">
              NOT AVAILABLE
            </button>
          </PanelCard>
        </div>
      )}

      {tab === "LAB" && (
        <div className="max-w-xl mx-auto">
          <PanelCard>
            <p className="font-tech text-xs tracking-widest text-zinc-300">MUTATION</p>
            <h3 className="mt-3 font-bangers text-4xl text-green tracking-wide">LAB</h3>
            <p className="mt-4 font-tech text-sm leading-relaxed text-zinc-300">
              Lab will operate on a selected vial from Inventory. Stats (purity, stability, potency) are designed into the metadata. The upgrade contract is not live.
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
