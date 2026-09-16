"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import PanelCard from "@/components/PanelCard";
import MintClassCard from "@/components/MintClassCard";
import { MOCK_NFTS } from "@/lib/mockData";
import { getXSession } from "@/lib/x-session";
import { loadPlayer } from "@/lib/points";
import {
  RARITY_SPECS,
  SUPPLY,
  doseProgress,
  mintClassFromRank,
  purityFromPoints,
} from "@/lib/protocol";
import type { Rarity } from "@/lib/types";

const FILTERS = ["ALL", "MYTHIC", "LEGENDARY", "EPIC", "RARE", "COMMON"] as const;
type Tab = "STRAINS" | "DOSE" | "$PLAGUES";

export default function VaultPage() {
  const [tab, setTab] = useState<Tab>("STRAINS");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [rank, setRank] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const x = getXSession() || loadPlayer().xHandle || "";
    if (!x) {
      setPoints(loadPlayer().points);
      return;
    }
    fetch(`/api/stats?x=${encodeURIComponent(x)}`)
      .then((r) => r.json())
      .then((json) => {
        setRank(json.rank ?? null);
        setPoints(json.points ?? 0);
        setJoined(Boolean(json.joined || json.rank));
      })
      .catch(() => setPoints(loadPlayer().points));
  }, []);

  const list = useMemo(
    () => MOCK_NFTS.filter((n) => filter === "ALL" || n.rarity === filter),
    [filter]
  );
  const cls = mintClassFromRank(rank, joined);
  const purity = purityFromPoints(points);
  const progress = doseProgress(points);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="VAULT" subtitle="YOUR VIAL IS EMPTY. YOUR DOSE IS NOT." />

      <p className="max-w-2xl mx-auto mb-8 text-center font-tech text-[11px] sm:text-xs tracking-widest text-gray leading-relaxed">
        Waitlist rank sets extraction priority. Points compound purity. Mint opens the cap. $PLAGUES stays sealed until the Cure.
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(["STRAINS", "DOSE", "$PLAGUES"] as Tab[]).map((item) => (
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

      {tab === "STRAINS" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
            {RARITY_SPECS.map((spec) => (
              <PanelCard key={spec.rarity} compact title={spec.rarity}>
                <p className="font-bangers text-xl text-green leading-none">{spec.supply}</p>
                <p className="mt-2 font-tech text-[9px] tracking-widest text-white">DOSE {spec.dose}</p>
                <p className="mt-2 font-tech text-[10px] leading-relaxed text-gray">{spec.line}</p>
                <p className="mt-2 font-tech text-[10px] leading-relaxed text-gray">{spec.perk}</p>
              </PanelCard>
            ))}
          </div>
          <p className="mb-4 font-tech text-[10px] tracking-widest text-gray">
            SUPPLY {SUPPLY.toLocaleString()} · BRIEFING ONLY · MINT STILL SEALED
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 font-tech text-[10px] tracking-widest uppercase ${
                  filter === f ? "bg-green text-black" : "border border-green/30 text-gray hover:text-green"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((nft) => (
              <AntidoteCard key={nft.id} nft={nft} compact briefing />
            ))}
          </div>
        </>
      )}

      {tab === "DOSE" && (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <MintClassCard rank={rank} joined={joined} points={points} />
          <PanelCard title="COMPOUNDING DOSE">
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div>
                <p className="font-tech text-[9px] text-gray tracking-widest">RANK</p>
                <p className="font-bangers text-3xl text-green text-aura leading-none">{rank ?? "\u2014"}</p>
              </div>
              <div>
                <p className="font-tech text-[9px] text-gray tracking-widest">PURITY</p>
                <p className="font-bangers text-3xl text-green text-aura leading-none">{purity}</p>
              </div>
              <div>
                <p className="font-tech text-[9px] text-gray tracking-widest">CLASS</p>
                <p className="font-bangers text-xl text-green text-aura leading-none mt-1">{cls.label}</p>
              </div>
            </div>
            <p className="font-tech text-[9px] text-gray tracking-widest mb-2">EXTRACTION CHARGE {progress}%</p>
            <div className="progress-bar-bg h-3">
              <div className="progress-bar-fill h-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 font-tech text-[11px] leading-relaxed text-gray">
              This is not an on-chain claim. Isolation will snapshot rank into a mint window. Higher rank extracts earlier. Points still move the dose.
            </p>
            <Link href="/task" className="inline-block mt-5 px-5 py-3 bg-green text-black font-tech text-xs tracking-widest hover:bg-green-bright">
              CLIMB RANK
            </Link>
          </PanelCard>
        </div>
      )}

      {tab === "$PLAGUES" && (
        <div className="max-w-xl mx-auto">
          <PanelCard className="relative overflow-hidden text-center">
            <p className="font-tech text-[10px] tracking-widest text-gray">CURE PROTOCOL</p>
            <h3 className="mt-3 font-bangers text-5xl text-green text-aura tracking-widest">$PLAGUES</h3>
            <p className="mt-4 font-tech text-[11px] leading-relaxed text-gray">
              Claim stays locked until Outbreak. A living vial is the key. No contract. No extract. No fake button.
            </p>
            <div className="mt-6 progress-bar-bg h-3">
              <div className="progress-bar-fill h-full opacity-30" style={{ width: "4%" }} />
            </div>
            <p className="mt-2 font-tech text-[9px] tracking-widest text-gray">UNLOCKS AFTER MINT · 4%</p>
            <button type="button" disabled className="mt-6 w-full py-4 font-tech tracking-[0.2em] uppercase bg-green/30 text-black cursor-not-allowed opacity-50">
              CLAIM SEALED
            </button>
            <p className="mt-4 font-tech text-[10px] tracking-widest text-green">PHASE 4 · CURE</p>
          </PanelCard>
        </div>
      )}
    </div>
  );
}
