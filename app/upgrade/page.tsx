"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";
import { OPENSEA_MINT, RARITY_SPECS } from "@/lib/protocol";
import { useOwnedVials } from "@/lib/useOwnedVials";
import {
  LAB_ABI,
  LAB_CONTRACT_ADDRESS,
  MUTATE_STATS,
  blockscoutTxUrl,
  isLabConfigured,
  isPlaguesConfigured,
  readPlaguesBalance,
  type MutateStat,
} from "@/lib/lab-contracts";

const STAT_DESC: Record<MutateStat, string> = {
  PURITY: "RAISES THE VIAL'S PURITY",
  STABILITY: "RAISES THE VIAL'S STABILITY",
  POTENCY: "RAISES THE VIAL'S POTENCY",
};

export default function UpgradePage() {
  const { address, isConnected } = useAccount();
  const owned = useOwnedVials(address);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [stat, setStat] = useState<MutateStat>("PURITY");
  const [lastAction, setLastAction] = useState<"MUTATE" | "EXTRACT" | null>(null);
  const [plagues, setPlagues] = useState<number | null>(null);

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const labReady = isLabConfigured();
  const hasVial = selectedToken !== null;

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

  // The balance only means something when the token is configured; the
  // unconfigured state is derived during render, not set in the effect.
  const plaguesShown = isPlaguesConfigured() && address ? plagues : null;

  const mutateDisabledReason = !hasVial
    ? "SELECT A VIAL FIRST"
    : !labReady
      ? "SEALED — LAB CONTRACT NOT DEPLOYED"
      : isPending || isConfirming
        ? "TRANSACTION PENDING…"
        : null;

  const extractDisabledReason = mutateDisabledReason;

  const doMutate = () => {
    if (!hasVial || !labReady) return;
    setLastAction("MUTATE");
    writeContract({
      address: LAB_CONTRACT_ADDRESS as `0x${string}`,
      abi: LAB_ABI,
      functionName: "mutate",
      args: [BigInt(selectedToken), MUTATE_STATS.indexOf(stat)],
    });
  };

  const doExtract = () => {
    if (!hasVial || !labReady) return;
    setLastAction("EXTRACT");
    writeContract({
      address: LAB_CONTRACT_ADDRESS as `0x${string}`,
      abi: LAB_ABI,
      functionName: "extract",
      args: [BigInt(selectedToken)],
    });
  };

  const applyManualToken = () => {
    const n = Number(manualToken.trim());
    if (Number.isInteger(n) && n > 0) setSelectedToken(n);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="LAB" subtitle="UPGRADE VIALS ON-CHAIN — MUTATE STATS, EXTRACT $PLAGUES" />

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

      <PanelCard title="01 — SELECT VIAL" className="mb-3">
        {owned.tokenIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {owned.tokenIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedToken(id)}
                className={`px-4 py-3 border font-tech text-xs tracking-widest ${
                  selectedToken === id ? "bg-green text-black border-green" : "border-green/30 text-green hover:bg-darkGreen"
                }`}
              >
                TOKEN #{id}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="font-bangers text-3xl text-green text-aura tracking-wide">NO VIALS IN WALLET</p>
            <p className="mt-3 font-tech text-[11px] leading-relaxed text-zinc-400">
              {owned.status === "not-minted"
                ? "COLLECTION NOT DEPLOYED YET — OWNED VIALS ARE READ ON-CHAIN AS SOON AS THE CONTRACT EXISTS"
                : !isConnected
                  ? "CONNECT A WALLET THAT HOLDS A VIAL AFTER MINT"
                  : "NO VIALS FOUND ON-CHAIN FOR THIS WALLET"}
            </p>
            <a
              href={OPENSEA_MINT}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-5 px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen"
            >
              MINT ON OPENSEA
            </a>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="OR ENTER TOKEN ID"
            className="flex-1 min-w-0 px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-base tracking-widest outline-none focus:border-green"
          />
          <button
            type="button"
            onClick={applyManualToken}
            disabled={!manualToken}
            className="px-5 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen disabled:opacity-40"
          >
            USE ID
          </button>
        </div>

        <p className="mt-4 font-tech text-[11px] tracking-widest text-green">
          {hasVial ? `SELECTED — TOKEN #${selectedToken}` : "NO VIAL SELECTED"}
        </p>

        <div className="mt-5">
          <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-2">STRAIN PREVIEW — WHAT A VIAL CAN BE</p>
          <div className="grid grid-cols-5 gap-2">
            {RARITY_SPECS.map((spec) => (
              <Link key={spec.rarity} href="/inventory" className="block border border-green/20 overflow-hidden">
                <div className="relative aspect-[2/3]">
                  <Image src={spec.image} alt={`${spec.rarity} vial`} fill sizes="20vw" className="object-cover" />
                </div>
                <p className="px-1 py-1 font-tech text-[8px] tracking-widest text-green text-center">{spec.rarity}</p>
              </Link>
            ))}
          </div>
        </div>
      </PanelCard>

      <div className="grid md:grid-cols-2 gap-3">
        <PanelCard title="02 — MUTATE">
          <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-3">PICK ONE STAT TO BOOST ON THE SELECTED VIAL</p>
          <div className="flex flex-col gap-2">
            {MUTATE_STATS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStat(s)}
                className={`w-full flex items-baseline justify-between gap-3 px-4 py-3 border text-left ${
                  stat === s ? "border-green bg-green/10" : "border-green/25 hover:border-green/60"
                }`}
              >
                <span className="font-tech text-sm tracking-widest text-white">{s}</span>
                <span className="font-tech text-[10px] tracking-widest text-zinc-400">{STAT_DESC[s]}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 font-tech text-[10px] tracking-widest text-zinc-400">EFFECT — SET BY THE LAB CONTRACT</p>
          <p className="mt-1 font-tech text-[10px] tracking-widest text-zinc-400">COST — SET BY THE LAB CONTRACT</p>
          <button
            type="button"
            disabled={Boolean(mutateDisabledReason)}
            onClick={doMutate}
            className="mt-5 w-full py-4 font-tech tracking-[0.2em] uppercase bg-green text-black hover:bg-green-bright disabled:bg-green/30 disabled:text-black/60 disabled:cursor-not-allowed"
          >
            {mutateDisabledReason || `MUTATE ${stat}`}
          </button>
        </PanelCard>

        <PanelCard title="03 — EXTRACT">
          <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-3">
            CLAIM $PLAGUES FROM THE SELECTED VIAL. ONE CLAIM PER VIAL PER SCHEDULE SET BY THE CONTRACT.
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
          <p className="mt-4 font-tech text-[10px] tracking-widest text-zinc-400">WAITLIST POINTS CANNOT EXTRACT — ONLY A HELD VIAL CAN.</p>
          <button
            type="button"
            disabled={Boolean(extractDisabledReason)}
            onClick={doExtract}
            className="mt-5 w-full py-4 font-tech tracking-[0.2em] uppercase bg-green text-black hover:bg-green-bright disabled:bg-green/30 disabled:text-black/60 disabled:cursor-not-allowed"
          >
            {extractDisabledReason || "EXTRACT $PLAGUES"}
          </button>
        </PanelCard>
      </div>

      <p className="mt-6 font-tech text-[10px] tracking-widest text-zinc-400 text-center">
        INVENTORY SHOWS WHAT YOU OWN · THE LAB IS WHERE YOU USE IT ·{" "}
        <Link href="/inventory" className="text-green hover:text-green-bright underline underline-offset-4 decoration-green/40">
          OPEN INVENTORY
        </Link>
      </p>
    </div>
  );
}
