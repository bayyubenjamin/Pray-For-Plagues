"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import ConnectWallet from "@/components/ConnectWallet";
import WaitlistForm from "@/components/WaitlistForm";
import { formatAddress } from "@/lib/utils";
import { TASKS, completeTask, loadPlayer, type PlayerState } from "@/lib/points";
import { saveRef } from "@/lib/referral";
import { loadWaitlist } from "@/lib/waitlist-local";
import { syncWaitlistFromServer } from "@/lib/sync-waitlist";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [player, setPlayer] = useState<PlayerState>({ completed: [], points: 0 });
  const [xMsg, setXMsg] = useState("");
  const [rank, setRank] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [officialWallet, setOfficialWallet] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) saveRef(ref);
    const x = params.get("x");
    const handle = params.get("handle");
    if (x === "connected" && handle) {
      completeTask("connect_x", { xHandle: handle });
      window.history.replaceState({}, "", "/profile");
      setXMsg("X CONNECTED");
    }
    setPlayer(loadPlayer());
    const local = loadWaitlist();
    setJoined(local.joined);
    setOfficialWallet(local.wallet || "");
  }, []);

  useEffect(() => {
    const handle = loadPlayer().xHandle;
    if (!handle) return;
    syncWaitlistFromServer(handle).then((row) => {
      setJoined(row.joined);
      setOfficialWallet(row.wallet || "");
      setPlayer(loadPlayer());
    });
    fetch(`/api/rank?x=${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((json) => setRank(json.rank ?? null))
      .catch(() => {});
  }, [player.xHandle]);

  const refLink = player.xHandle
    ? `https://prayforplagues.xyz/task?ref=${encodeURIComponent(player.xHandle)}`
    : "";

  const match =
    officialWallet && address
      ? officialWallet.toLowerCase() === address.toLowerCase()
      : false;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <SectionTitle title="PROFILE" subtitle="SYNCED FROM WAITLIST" />

      <div className="mt-8 border border-green/20 bg-black/50 p-5 sm:p-8 panel-border flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">POINTS</p>
            <p className="font-bangers text-4xl text-green text-aura">{player.points}</p>
          </div>
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">RANK</p>
            <p className="font-bangers text-4xl text-green text-aura">{rank ?? "\u2014"}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 font-tech text-xs tracking-widest">
          <div className="border border-green/20 p-4">
            <p className="text-gray">X</p>
            <p className="text-green mt-1">{player.xHandle ? `@${player.xHandle}` : "NOT CONNECTED"}</p>
          </div>
          <div className="border border-green/20 p-4">
            <p className="text-gray">WAITLIST WALLET</p>
            <p className="text-green mt-1">
              {officialWallet ? formatAddress(officialWallet) : "NOT JOINED"}
            </p>
          </div>
          <div className="border border-green/20 p-4 sm:col-span-2">
            <p className="text-gray">CONNECTED WALLET</p>
            <p className={`mt-1 ${match ? "text-green" : "text-white"}`}>
              {isConnected && address ? formatAddress(address) : "NOT CONNECTED"}
            </p>
            {joined && officialWallet && !match && (
              <p className="mt-3 text-[10px] text-green leading-relaxed">
                SWITCH WALLET TO {formatAddress(officialWallet)}. THAT ADDRESS WAS SAVED ON WAITLIST AND WILL BE USED AT MINT.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="font-tech text-[10px] tracking-widest text-gray mb-3">CONNECT X</p>
          {player.xHandle ? (
            <a href={`https://x.com/${player.xHandle}`} target="_blank" rel="noreferrer" className="font-tech text-green text-sm tracking-widest">
              @{player.xHandle}
            </a>
          ) : (
            <a href="/api/x/start" className="inline-block px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen box-aura">
              CONNECT X
            </a>
          )}
          {xMsg && <p className="mt-2 font-tech text-[10px] text-green tracking-widest">{xMsg}</p>}
        </div>

        {joined && (
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray mb-3">CONNECT WALLET</p>
            <ConnectWallet />
          </div>
        )}

        {player.xHandle && (
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray mb-3">REFERRAL</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(refLink);
                setCopied(true);
              }}
              className="w-full text-left px-4 py-3 border border-green/30 text-green font-tech text-[10px] tracking-widest break-all hover:bg-darkGreen"
            >
              {copied ? "COPIED" : refLink}
            </button>
          </div>
        )}

        <div>
          <p className="font-tech text-[10px] tracking-widest text-gray mb-3">WAITLIST</p>
          <WaitlistForm xHandle={player.xHandle} />
        </div>

        <div>
          <p className="font-tech text-[10px] tracking-widest text-gray mb-4">TASKS</p>
          <ul className="space-y-2">
            {TASKS.map((task) => {
              const done = player.completed.includes(task.id);
              return (
                <li key={task.id} className="flex items-center justify-between border border-green/15 px-3 py-3 font-tech text-xs tracking-widest">
                  <span className={done ? "text-green" : "text-white"}>{done ? "\u2713 " : "\u2022 "}{task.label}</span>
                  <span className="text-green">+{task.points}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
