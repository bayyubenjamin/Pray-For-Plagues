"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import ConnectWallet from "@/components/ConnectWallet";
import WaitlistForm from "@/components/WaitlistForm";
import { formatAddress } from "@/lib/utils";
import { robinhoodChain } from "@/lib/config";
import { TASKS, completeTask, loadPlayer, type PlayerState } from "@/lib/points";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [player, setPlayer] = useState<PlayerState>({ completed: [], points: 0 });
  const [xMsg, setXMsg] = useState("");

  const onRh = chainId === robinhoodChain.id;

  useEffect(() => {
    setPlayer(loadPlayer());
    const params = new URLSearchParams(window.location.search);
    const x = params.get("x");
    const handle = params.get("handle");
    if (x === "connected" && handle) {
      completeTask("connect_x", { xHandle: handle });
      setPlayer(loadPlayer());
      setXMsg("X CONNECTED");
      window.history.replaceState({}, "", "/profile");
    } else if (x === "missing_app") {
      setXMsg("SET X_CLIENT_ID ON VERCEL");
    } else if (x === "denied") {
      setXMsg("X AUTH CANCELED");
    } else if (x === "token_error" || x === "user_error") {
      setXMsg("X AUTH FAILED. CHECK APP SETTINGS.");
    }
  }, [address, chainId]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <SectionTitle title="PROFILE" subtitle="WALLET. X. TASKS. POINTS." />

      <div className="mt-8 border border-green/20 bg-black/50 p-5 sm:p-8 panel-border flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">POINTS</p>
            <p className="font-bangers text-4xl text-green text-aura">{player.points}</p>
          </div>
          <ConnectWallet />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 font-tech text-xs tracking-widest">
          <div className="border border-green/20 p-4">
            <p className="text-gray">WALLET</p>
            <p className="text-green mt-1">{isConnected && address ? formatAddress(address) : "NOT CONNECTED"}</p>
          </div>
          <div className="border border-green/20 p-4">
            <p className="text-gray">NETWORK</p>
            <p className="text-green mt-1">{onRh ? "ROBINHOOD 4663" : "SWITCH REQUIRED"}</p>
            {isConnected && !onRh && (
              <button
                onClick={() => switchChain({ chainId: robinhoodChain.id })}
                className="mt-3 text-green border border-green px-3 py-1 hover:bg-darkGreen"
              >
                {isPending ? "SWITCHING..." : "ADD / SWITCH RH"}
              </button>
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
            <a
              href="/api/x/start"
              className="inline-block px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen box-aura"
            >
              CONNECT X
            </a>
          )}
          {xMsg && <p className="mt-2 font-tech text-[10px] text-green tracking-widest">{xMsg}</p>}
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

        <div>
          <p className="font-tech text-[10px] tracking-widest text-gray mb-4">WAITLIST</p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
