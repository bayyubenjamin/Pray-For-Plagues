"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";
import { OPENSEA_MINT, RARITY_SPECS } from "@/lib/protocol";
import { STRAIN_PREVIEW } from "@/lib/mockData";
import { useOwnedVials } from "@/lib/useOwnedVials";
import { UPGRADE_PATH, groupOwnedByRarity, nextTier } from "@/lib/upgrade-path";
import {
  LAB_ABI,
  LAB_CONTRACT_ADDRESS,
  blockscoutTxUrl,
  isLabConfigured,
  isPlaguesConfigured,
  readPlaguesBalance,
} from "@/lib/lab-contracts";
import { getXSession } from "@/lib/x-session";
import { loadPlayer } from "@/lib/points";
import type { Rarity } from "@/lib/types";

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

function StatCompare({ label, from, to }: { label: string; from: number; to: number }) {
  const delta = to - from;
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-green/10 last:border-b-0">
      <span className="font-tech text-[10px] tracking-widest text-zinc-400">{label}</span>
      <span className="font-tech text-xs tracking-widest text-white">
        {from.toFixed(1)} <span className="text-zinc-500">→</span>{" "}
        <span className="text-green">
          {to.toFixed(1)} {delta > 0 ? `(+${delta.toFixed(1)})` : ""}
        </span>
      </span>
    </div>
  );
}

export default function UpgradePage() {
  const { address } = useAccount();
  const owned = useOwnedVials(address);
  const [selected, setSelected] = useState<Rarity>("COMMON");
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<"UPGRADE" | "EXTRACT" | null>(null);
  const [plagues, setPlagues] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const labReady = isLabConfigured();
  const ownedByRarity = useMemo(() => groupOwnedByRarity(owned.tokenIds), [owned.tokenIds]);
  const held = ownedByRarity[selected] ?? [];
  const tokenId = selectedToken ?? held[0] ?? null;

  const spec = RARITY_SPECS.find((s) => s.rarity === selected)!;
  const preview = STRAIN_PREVIEW.find((n) => n.rarity === selected);
  const step = nextTier(selected);
  const nextSpec = step ? RARITY_SPECS.find((s) => s.rarity === step.to) : undefined;
  const nextPreview = step ? STRAIN_PREVIEW.find((n) => n.rarity === step.to) : undefined;

  // Ownership of the selected vial, from the on-chain token ids.
  const ownership =
    owned.status === "not-minted"
      ? "COLLECTION NOT DEPLOYED"
      : owned.status === "no-wallet"
        ? "CONNECT WALLET TO CHECK OWNERSHIP"
        : owned.status === "loading"
          ? "CHECKING CHAIN…"
          : owned.status === "error"
            ? "CHAIN CHECK FAILED"
            : held.length > 0
              ? "OWNED"
              : "YOU DON'T HAVE THIS VIAL";

  useEffect(() => {
    if (!address || !isPlaguesConfigured()) return;
    let cancelled = false;
    readPlaguesBalance(address).then((b) => {
      if (!cancelled) setPlagues(b);
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    const handle = getXSession() || loadPlayer().xHandle || "";
    if (!handle) return;
    fetch(`/api/stats?x=${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((json) => {
        if (typeof json?.points === "number") setPoints(json.points);
      })
      .catch(() => {});
  }, []);

  const plaguesShown = isPlaguesConfigured() && address ? plagues : null;

  const pick = (rarity: Rarity) => {
    setSelected(rarity);
    setSelectedToken(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reason order matters: the contract not existing is the blocker for
  // everyone (nobody owns anything yet); "YOU DON'T HAVE THIS VIAL" only
  // applies once the collection is live and the wallet holds none.
  const upgradeDisabledReason = !step
    ? "MAX TIER — ALREADY MYTHIC"
    : !labReady
      ? "SEALED — LAB CONTRACT NOT DEPLOYED"
      : held.length === 0
        ? "YOU DON'T HAVE THIS VIAL"
        : isPending || isConfirming
          ? "TRANSACTION PENDING…"
          : null;

  const extractDisabledReason = !labReady
    ? "SEALED — LAB CONTRACT NOT DEPLOYED"
    : held.length === 0
      ? "YOU DON'T HAVE THIS VIAL"
      : isPending || isConfirming
        ? "TRANSACTION PENDING…"
        : null;

  const doUpgrade = () => {
    if (!step || !tokenId || !labReady) return;
    setLastAction("UPGRADE");
    writeContract({
      address: LAB_CONTRACT_ADDRESS as `0x${string}`,
      abi: LAB_ABI,
      functionName: "upgrade",
      args: [BigInt(tokenId)],
    });
  };

  const doExtract = () => {
    if (!tokenId || !labReady) return;
    setLastAction("EXTRACT");
    writeContract({
      address: LAB_CONTRACT_ADDRESS as `0x${string}`,
      abi: LAB_ABI,
      functionName: "extract",
      args: [BigInt(tokenId)],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="LAB" subtitle="UPGRADE VIALS ON-CHAIN — COMMON TO MYTHIC, PAID IN $PLAGUES + POINTS" />

      {(hash || error) && (
        <div className="card-panel p-4 mb-4">
          <p className="font-tech text-[10px] tracking-widest text-zinc-400">TRANSACTION</p>
          {hash && (
            <p className="mt-2 font-tech text-[11px] tracking-widest text-green">
              {isSuccess ? `CONFIRMED — ${lastAction || "DONE"}` : isConfirming ? "CONFIRMING…" : "SENT — WAITING FOR CONFIRMATION"}
            </p>
          )}
          {hash && (
            <a
              href={blockscoutTxUrl(hash)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block font-tech text-[11px] tracking-widest text-green underline underline-offset-4 decoration-green/40 break-all"
            >
              {hash.slice(0, 10)}…{hash.slice(-8)} — VIEW ON BLOCKSCOUT
            </a>
          )}
          {error && (
            <p className="mt-2 font-tech text-[11px] tracking-widest text-red-500">
              FAILED — {error.message.split("\n")[0].slice(0, 120)}
            </p>
          )}
        </div>
      )}

      {/* Selected vial — compact on phones: small thumb + details beside it. */}
      <div className="card-panel p-4 sm:p-5 mb-3">
        <div className="flex gap-4">
          <div className="relative w-24 sm:w-44 shrink-0 aspect-[2/3] overflow-hidden border border-green/15 bg-black">
            <Image src={spec.image} alt={`${spec.rarity} antidote vial`} fill sizes="176px" className="object-cover" priority />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bangers text-3xl sm:text-4xl text-green tracking-wide leading-none">{spec.rarity}</h3>
              <span className="shrink-0 text-[10px] px-2 py-0.5 border border-green/40 font-tech tracking-wider text-green">
                {spec.supply.toLocaleString()}
              </span>
            </div>
            <p className="font-tech text-xs sm:text-sm leading-relaxed text-zinc-300">{spec.line}</p>
            <p className="font-tech text-[11px] tracking-widest text-green">{spec.perk}</p>
            <p className={`font-tech text-[11px] tracking-widest ${held.length > 0 ? "text-green" : "text-zinc-300"}`}>
              {ownership}
              {held.length > 0 ? ` — ${held.length} VIAL${held.length > 1 ? "S" : ""}` : ""}
            </p>
            {held.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {held.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedToken(id)}
                    className={`px-3 py-1.5 border font-tech text-[11px] tracking-widest ${
                      tokenId === id ? "bg-green text-black border-green" : "border-green/30 text-green hover:bg-darkGreen"
                    }`}
                  >
                    TOKEN #{id}
                  </button>
                ))}
              </div>
            )}
            {owned.status === "not-minted" && (
              <p className="font-tech text-[10px] tracking-widest text-zinc-400">
                OWNERSHIP IS CHECKED ON-CHAIN AS SOON AS THE CONTRACT EXISTS
              </p>
            )}
            {held.length === 0 && owned.status === "live" && (
              <a
                href={OPENSEA_MINT}
                target="_blank"
                rel="noreferrer"
                className="inline-block self-start mt-1 px-4 py-2 border border-green text-green font-tech text-[11px] tracking-widest hover:bg-darkGreen"
              >
                MINT ON OPENSEA
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-y border-green/15 py-3 mt-4">
          <div>
            <p className="font-tech text-[10px] tracking-widest text-zinc-400">SUPPLY</p>
            <p className="mt-1 font-bangers text-2xl text-green leading-none">{spec.supply.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-tech text-[10px] tracking-widest text-zinc-400">TOKEN RANGE</p>
            <p className="mt-1 font-tech text-sm text-white">{spec.range}</p>
          </div>
          <div>
            <p className="font-tech text-[10px] tracking-widest text-zinc-400">DOSE</p>
            <p className="mt-1 font-tech text-sm text-white">{spec.dose}</p>
          </div>
        </div>

        {preview && (
          <div className="flex flex-col gap-3 mt-4">
            <StatBar label="PURITY" value={preview.purity} />
            <StatBar label="STABILITY" value={preview.stability} />
            <StatBar label="POTENCY" value={preview.potency} />
          </div>
        )}

        <p className="mt-3 font-tech text-[9px] tracking-widest text-zinc-500">STRAIN PREVIEW — ILLUSTRATIVE STATS ONLY. REAL STATS COME AFTER MINT.</p>
      </div>

      {/* Upgrade ladder for the selected vial. */}
      <PanelCard title="UPGRADE" className="mb-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {UPGRADE_PATH.map((s, i) => (
            <span key={s.from} className="flex items-center gap-1.5 shrink-0">
              <span
                className={`px-2 py-1 border font-tech text-[10px] tracking-widest ${
                  s.from === selected ? "bg-green text-black border-green" : "border-green/25 text-zinc-300"
                }`}
              >
                {s.from}
              </span>
              <span className="font-tech text-[10px] text-zinc-500">→</span>
              {i === UPGRADE_PATH.length - 1 && (
                <span
                  className={`px-2 py-1 border font-tech text-[10px] tracking-widest ${
                    selected === "MYTHIC" ? "bg-green text-black border-green" : "border-green/25 text-zinc-300"
                  }`}
                >
                  MYTHIC
                </span>
              )}
            </span>
          ))}
        </div>

        {step && nextSpec ? (
          <>
            <p className="font-bangers text-3xl text-green tracking-wide leading-none">
              {step.from} → {step.to}
            </p>
            <p className="mt-2 font-tech text-[11px] tracking-widest text-zinc-400">
              ONE TIER UP. THE UPGRADED VIAL KEEPS ITS TOKEN ID.
            </p>

            {/* Upgrade preview: what the vial becomes, side by side. */}
            <div className="mt-4 border border-green/20 p-4">
              <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-3">UPGRADE PREVIEW — WHAT IT BECOMES</p>
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <div className="text-center">
                  <div className="relative w-16 sm:w-20 aspect-[2/3] mx-auto overflow-hidden border border-green/20">
                    <Image src={spec.image} alt={`${spec.rarity} vial now`} fill sizes="80px" className="object-cover" />
                  </div>
                  <p className="mt-1.5 font-tech text-[9px] tracking-widest text-zinc-400">{spec.rarity} — NOW</p>
                </div>
                <span className="font-bangers text-3xl text-green leading-none">→</span>
                <div className="text-center">
                  <div className="relative w-16 sm:w-20 aspect-[2/3] mx-auto overflow-hidden border border-green">
                    <Image src={nextSpec.image} alt={`${nextSpec.rarity} vial after upgrade`} fill sizes="80px" className="object-cover" />
                  </div>
                  <p className="mt-1.5 font-tech text-[9px] tracking-widest text-green">{nextSpec.rarity} — AFTER UPGRADE</p>
                </div>
              </div>
              {preview && nextPreview && (
                <div className="mt-3">
                  <StatCompare label="PURITY" from={preview.purity} to={nextPreview.purity} />
                  <StatCompare label="STABILITY" from={preview.stability} to={nextPreview.stability} />
                  <StatCompare label="POTENCY" from={preview.potency} to={nextPreview.potency} />
                </div>
              )}
              <p className="mt-2 font-tech text-[9px] tracking-widest text-zinc-500 text-center">
                PREVIEW ONLY — REAL UPGRADED STATS COME FROM THE CONTRACT.
              </p>
            </div>

            <div className="mt-4 border border-green/20 divide-y divide-green/10">
              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="font-tech text-[11px] tracking-widest text-white">COST — $PLAGUES</span>
                <span className="font-tech text-[11px] tracking-widest text-zinc-400">
                  {step.plaguesCost !== null ? step.plaguesCost.toLocaleString() : "TBA — SET BY THE LAB CONTRACT"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="font-tech text-[11px] tracking-widest text-white">COST — POINTS</span>
                <span className="font-tech text-[11px] tracking-widest text-zinc-400">
                  {step.pointsCost !== null ? step.pointsCost.toLocaleString() : "TBA — SET BY THE LAB CONTRACT"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="font-tech text-[11px] tracking-widest text-white">YOUR BALANCE</span>
                <span className="font-tech text-[11px] tracking-widest text-green">
                  {plaguesShown !== null ? `${plaguesShown.toLocaleString(undefined, { maximumFractionDigits: 2 })} $PLAGUES` : "— $PLAGUES"}
                  {" · "}
                  {points !== null ? `${points} PTS` : "— PTS"}
                </span>
              </div>
            </div>
            <button
              type="button"
              disabled={Boolean(upgradeDisabledReason)}
              onClick={doUpgrade}
              className="mt-4 w-full py-4 font-tech tracking-[0.2em] uppercase bg-green text-black hover:bg-green-bright disabled:bg-green/30 disabled:text-black/60 disabled:cursor-not-allowed"
            >
              {upgradeDisabledReason || `UPGRADE TO ${step.to}`}
            </button>
            {points === null && (
              <p className="mt-2 font-tech text-[10px] tracking-widest text-zinc-400 text-center">
                <Link href="/task" className="text-green hover:text-green-bright underline underline-offset-4 decoration-green/40">
                  EARN POINTS ON TASK
                </Link>{" "}
                — THEY PAY FOR UPGRADES.
              </p>
            )}
          </>
        ) : (
          <p className="font-bangers text-3xl text-green tracking-wide leading-none">MAX TIER — ALREADY MYTHIC</p>
        )}
      </PanelCard>

      {/* Choose a vial — small strip, right below Upgrade. */}
      <PanelCard title="CHOOSE A VIAL" compact className="mb-3">
        <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-3">TAP A VIAL — IT APPEARS AT THE TOP WITH ITS UPGRADE PATH.</p>
        <div className="grid grid-cols-5 gap-2">
          {RARITY_SPECS.map((s) => {
            const n = ownedByRarity[s.rarity]?.length ?? 0;
            const badge =
              owned.status === "live" ? (n > 0 ? `OWNED ${n}` : "NOT OWNED") : owned.status === "not-minted" ? "NOT MINTED" : "—";
            return (
              <button
                key={s.rarity}
                type="button"
                onClick={() => pick(s.rarity)}
                className={`card-lift border bg-black overflow-hidden text-left cursor-pointer ${
                  selected === s.rarity ? "border-green" : "border-green/20"
                }`}
                aria-label={`${s.rarity} vial, select for upgrade`}
              >
                <div className="relative aspect-[2/3]">
                  <Image src={s.image} alt={`${s.rarity} antidote vial`} fill sizes="15vw" className="object-cover" />
                </div>
                <p className="px-1 pt-1 font-tech text-[8px] sm:text-[10px] tracking-widest text-green text-center truncate">{s.rarity}</p>
                <p className={`px-1 pb-1.5 font-tech text-[8px] tracking-widest text-center truncate ${n > 0 ? "text-green" : "text-zinc-400"}`}>
                  {badge}
                </p>
              </button>
            );
          })}
        </div>
      </PanelCard>

      {/* Extract — the $PLAGUES side of the loop. */}
      <PanelCard title="EXTRACT">
        <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-3">
          CLAIM $PLAGUES FROM THE SELECTED VIAL. EXTRACT FEEDS UPGRADES — THAT IS HOW THE ECOSYSTEM RUNS.
        </p>
        <div className="border border-green/20 p-4">
          <p className="font-tech text-[10px] tracking-widest text-zinc-400">YOUR $PLAGUES</p>
          <p className="font-bangers text-3xl text-green text-aura leading-none mt-1">
            {plaguesShown !== null ? plaguesShown.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
          </p>
          <p className="mt-1 font-tech text-[9px] tracking-widest text-zinc-500">
            {isPlaguesConfigured() ? "READ ON-CHAIN" : "TOKEN NOT DEPLOYED"}
          </p>
        </div>
        <button
          type="button"
          disabled={Boolean(extractDisabledReason)}
          onClick={doExtract}
          className="mt-4 w-full py-4 font-tech tracking-[0.2em] uppercase bg-green text-black hover:bg-green-bright disabled:bg-green/30 disabled:text-black/60 disabled:cursor-not-allowed"
        >
          {extractDisabledReason || "EXTRACT $PLAGUES"}
        </button>
      </PanelCard>

      <p className="mt-6 font-tech text-[10px] tracking-widest text-zinc-400 text-center">
        INVENTORY SHOWS WHAT YOU OWN · THE LAB IS WHERE YOU USE IT ·{" "}
        <Link href="/inventory" className="text-green hover:text-green-bright underline underline-offset-4 decoration-green/40">
          OPEN INVENTORY
        </Link>
      </p>
    </div>
  );
}
