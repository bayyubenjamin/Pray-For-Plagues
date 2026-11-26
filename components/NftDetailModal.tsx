"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AntidoteNFT } from "@/lib/types";
import { OPENSEA_MINT, RARITY_SPECS } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const RARITY_COLORS = {
  COMMON: "text-zinc-300 border-zinc-400/40",
  RARE: "text-blue-400 border-blue-400/40",
  EPIC: "text-purple-400 border-purple-400/40",
  LEGENDARY: "text-yellow-400 border-yellow-400/40",
  MYTHIC: "text-red-400 border-red-400/40",
};

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-tech text-[10px] tracking-[0.2em] text-zinc-400">{label}</p>
        <p className="font-tech text-sm text-green">{value.toFixed(1)}</p>
      </div>
      <div className="mt-1 h-1 bg-green/10">
        <div className="h-full bg-green" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export default function NftDetailModal({
  nft,
  onClose,
}: {
  nft: AntidoteNFT | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!nft) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nft, onClose]);

  if (!nft) return null;

  const spec = RARITY_SPECS.find((s) => s.rarity === nft.rarity);
  const traits: Array<[string, string]> = [
    ["VIAL", nft.vial],
    ["LIQUID", nft.liquid],
    ["CAP", nft.cap],
    ["LABEL", nft.label],
    ["SYMBOL", nft.symbol],
    ["AURA", nft.aura],
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:px-4">
      <button type="button" className="absolute inset-0 bg-black/85" onClick={onClose} aria-label="Close" />
      <div className="animate-modal relative w-full max-w-2xl border border-green/40 bg-black panel-border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-green/15 bg-black px-5 sm:px-6 py-3">
          <p className="font-tech text-[10px] tracking-[0.25em] text-zinc-400">STRAIN #{nft.id}</p>
          <button type="button" onClick={onClose} className="font-tech text-xs tracking-widest text-zinc-400 hover:text-green">
            CLOSE
          </button>
        </div>

        <div className="grid sm:grid-cols-[220px_1fr]">
          <div className="relative aspect-[2/3] sm:aspect-auto sm:min-h-[330px] border-b sm:border-b-0 sm:border-r border-green/15 bg-black">
            {spec?.image && (
              <Image
                src={spec.image}
                alt={`${nft.rarity} antidote vial`}
                fill
                sizes="220px"
                className="object-cover"
              />
            )}
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bangers text-3xl sm:text-4xl text-green tracking-wide leading-none">{nft.rarity}</h3>
                <span className={cn("shrink-0 text-[10px] px-2 py-0.5 border uppercase font-tech tracking-wider", RARITY_COLORS[nft.rarity])}>
                  LV {nft.level}
                </span>
              </div>
              {spec?.line && <p className="mt-2 font-tech text-sm leading-relaxed text-zinc-300">{spec.line}</p>}
              {spec?.perk && <p className="mt-1 font-tech text-xs tracking-widest text-green">{spec.perk}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-green/15 py-4">
              <div>
                <p className="font-tech text-[10px] tracking-widest text-zinc-400">SUPPLY</p>
                <p className="mt-1 font-bangers text-2xl text-green leading-none">{spec?.supply.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-tech text-[10px] tracking-widest text-zinc-400">TOKEN RANGE</p>
                <p className="mt-1 font-tech text-sm text-white">{spec?.range}</p>
              </div>
              <div>
                <p className="font-tech text-[10px] tracking-widest text-zinc-400">DOSE</p>
                <p className="mt-1 font-tech text-sm text-white">{spec?.dose}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <StatBar label="PURITY" value={nft.purity} />
              <StatBar label="STABILITY" value={nft.stability} />
              <StatBar label="POTENCY" value={nft.potency} />
            </div>

            <div>
              <p className="font-tech text-[10px] tracking-[0.25em] text-zinc-400 mb-2">TRAITS</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {traits.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-2 border-b border-green/10 pb-1">
                    <dt className="font-tech text-[10px] tracking-widest text-zinc-400">{label}</dt>
                    <dd className="font-tech text-xs text-white text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="font-tech text-[10px] leading-relaxed tracking-widest text-zinc-400">
              STRAIN PREVIEW — ILLUSTRATIVE STATS ONLY. REAL STATS COME AFTER MINT.
            </p>
            <a
              href={OPENSEA_MINT}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 border border-green text-green font-tech text-xs tracking-widest text-center hover:bg-darkGreen"
            >
              VIEW ON OPENSEA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
