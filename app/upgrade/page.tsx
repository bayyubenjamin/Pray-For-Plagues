"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import PanelCard from "@/components/PanelCard";
import ConnectWallet from "@/components/ConnectWallet";
import { OPENSEA_MINT } from "@/lib/protocol";
import { useOwnedVials } from "@/lib/useOwnedVials";

function Operation({
  tag,
  title,
  body,
  requires,
  lockedNote,
}: {
  tag: string;
  title: string;
  body: string;
  requires: string[];
  lockedNote: string;
}) {
  return (
    <PanelCard>
      <p className="font-tech text-xs tracking-widest text-zinc-300">{tag}</p>
      <h3 className="mt-3 font-bangers text-4xl text-green tracking-wide">{title}</h3>
      <p className="mt-4 font-tech text-sm leading-relaxed text-zinc-300">{body}</p>
      <div className="mt-5 flex flex-col gap-2">
        {requires.map((r) => (
          <p key={r} className="font-tech text-[10px] tracking-widest text-zinc-400">
            REQUIRES — {r}
          </p>
        ))}
      </div>
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-6 w-full py-4 font-tech tracking-[0.2em] uppercase border border-green/20 text-zinc-400 cursor-not-allowed"
      >
        {lockedNote}
      </button>
    </PanelCard>
  );
}

export default function UpgradePage() {
  const { address, isConnected } = useAccount();
  const owned = useOwnedVials(address);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="LAB" subtitle="OPERATIONS ON VIALS YOU HOLD — EXTRACT $PLAGUES, MUTATE STATS" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
        <PanelCard title="YOUR VIALS" compact>
          <p className="font-bangers text-3xl text-green text-aura leading-none">{owned.count}</p>
          <p className="mt-1 font-tech text-[9px] tracking-widest text-zinc-500">
            {owned.status === "not-minted"
              ? "COLLECTION NOT DEPLOYED"
              : owned.status === "live"
                ? "READ ON-CHAIN"
                : owned.status === "loading"
                  ? "CHECKING CHAIN…"
                  : "CONNECT WALLET TO CHECK"}
          </p>
        </PanelCard>
        <PanelCard title="WALLET" compact>
          <p className="font-tech text-sm text-green tracking-widest truncate">
            {isConnected && address ? address : "—"}
          </p>
        </PanelCard>
        <PanelCard title="NETWORK" compact>
          <p className="font-tech text-sm text-green tracking-widest">ROBINHOOD 4663</p>
        </PanelCard>
      </div>

      <div className="mb-8">
        <ConnectWallet />
      </div>

      {owned.count === 0 && (
        <div className="card-panel p-5 mb-8 text-center">
          <p className="font-bangers text-3xl text-green text-aura tracking-wide">NO VIAL</p>
          <p className="mt-3 font-tech text-[11px] leading-relaxed text-zinc-400">
            LAB OPERATIONS NEED A VIAL IN THE CONNECTED WALLET. MINT STAYS ON OPENSEA — THIS SITE NEVER MINTS.
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

      <div className="grid md:grid-cols-2 gap-3">
        <Operation
          tag="$PLAGUES"
          title="EXTRACT"
          body="Extract claims $PLAGUES from a vial you own. One vial, one claim schedule — set by the token contract when it deploys. Waitlist points cannot extract."
          requires={["HOLD AT LEAST 1 VIAL", "ROBINHOOD CHAIN 4663"]}
          lockedNote="SEALED — TOKEN NOT DEPLOYED"
        />
        <Operation
          tag="MUTATION"
          title="MUTATE"
          body="Mutate changes a held vial's stats — purity, stability, potency — as recorded in its metadata. Dose and rarity rules ship with the upgrade contract."
          requires={["HOLD AT LEAST 1 VIAL", "SELECT A VIAL FROM INVENTORY"]}
          lockedNote="SEALED — CONTRACT NOT LIVE"
        />
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
