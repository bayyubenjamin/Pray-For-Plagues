"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";
import ConnectWallet from "@/components/ConnectWallet";
import dynamic from "next/dynamic";
import { OPENSEA_MINT, RARITY_SPECS, SUPPLY } from "@/lib/protocol";
import { STRAIN_PREVIEW } from "@/lib/mockData";
import { AntidoteNFT } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import { useOwnedVials } from "@/lib/useOwnedVials";

// Loaded on demand only — the modal chunk stays out of the first load.
const NftDetailModal = dynamic(() => import("@/components/NftDetailModal"), { ssr: false });

export default function InventoryPage() {
  const { address, isConnected } = useAccount();
  const [selected, setSelected] = useState<AntidoteNFT | null>(null);
  const owned = useOwnedVials(address);
  const ownedCount = owned.count;

  const statusText =
    owned.status === "no-wallet"
      ? "CONNECT WALLET"
      : owned.status === "not-minted"
        ? "NOT MINTED"
        : owned.status === "loading"
          ? "CHECKING CHAIN…"
          : owned.status === "error"
            ? "CHAIN CHECK FAILED"
            : ownedCount > 0
              ? "IN WALLET"
              : "NONE HELD";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="INVENTORY" subtitle="HELD VIALS ONLY — UPGRADE AND EXTRACT LIVE IN THE LAB" />

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
                  <p className="font-tech text-sm text-green tracking-widest mt-2">{statusText}</p>
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

        <div className="card-panel cv-auto p-4 sm:p-6">
          <p className="font-tech text-xs tracking-[0.25em] text-zinc-300">THE FIVE STRAINS</p>
          <h3 className="mt-2 font-bangers text-2xl sm:text-3xl text-green tracking-wide">VIAL ART BY RARITY</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
            {RARITY_SPECS.map((spec) => (
              <button
                key={spec.rarity}
                type="button"
                onClick={() => setSelected(STRAIN_PREVIEW.find((n) => n.rarity === spec.rarity) || null)}
                className="card-lift border border-green/20 bg-black overflow-hidden text-left cursor-pointer"
                aria-label={`${spec.rarity} vial, view details`}
              >
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
              </button>
            ))}
          </div>
          <p className="mt-3 font-tech text-[10px] tracking-widest text-zinc-400">TAP A VIAL FOR FULL DETAILS</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              title: "HOLD",
              body: "The vial is the collectible. Traits and rarity live on the token after mint.",
            },
            {
              title: "EXTRACT",
              body: "$PLAGUES is planned to be claimed from a vial you own. The token is not live — see the Lab.",
            },
            {
              title: "UPGRADE",
              body: "Lab raises a held vial's rarity — purity, stability and potency, paid in $PLAGUES + points. No upgrade is live yet — see the Lab.",
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
          <p className="mt-3 font-bangers text-3xl text-green tracking-wide">
            {ownedCount > 0 ? `${ownedCount} VIAL${ownedCount > 1 ? "S" : ""} IN WALLET` : "NO VIALS IN WALLET"}
          </p>
          <p className="mt-3 font-tech text-xs text-zinc-300 tracking-widest">CONNECT A WALLET THAT HOLDS ONE AFTER MINT</p>
          <p className="mt-2 font-tech text-xs text-zinc-300/70 tracking-widest">
            {owned.status === "not-minted"
              ? "COLLECTION NOT DEPLOYED YET — OWNERSHIP IS CHECKED ON-CHAIN AS SOON AS THE CONTRACT EXISTS"
              : owned.status === "live"
                ? "BALANCE READ ON-CHAIN FROM THE ROBINHOOD RPC"
                : owned.status === "error"
                  ? "COULD NOT REACH THE CHAIN — TRY AGAIN"
                  : "OWNERSHIP IS CHECKED ON-CHAIN, NOT FROM A LOCAL LIST"}
          </p>
        </div>
      </div>

      <NftDetailModal nft={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
