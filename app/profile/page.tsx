"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import ConnectWallet from "@/components/ConnectWallet";
import { formatAddress } from "@/lib/utils";
import { completeTask, loadPlayer } from "@/lib/points";
import { getXSession, setXSession } from "@/lib/x-session";
import { syncWaitlistFromServer } from "@/lib/sync-waitlist";

type ProfileRow = {
  x_handle?: string;
  email?: string;
  wallet?: string;
  connected_wallet?: string;
  points?: number;
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [waitlistWallet, setWaitlistWallet] = useState("");
  const [rank, setRank] = useState<number | null>(null);
  const [mismatch, setMismatch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const x = params.get("x");
    const h = params.get("handle");
    if (x === "connected" && h) {
      setXSession(h);
      completeTask("connect_x", { xHandle: h });
      window.history.replaceState({}, "", "/profile");
    }
    const live = h || getXSession() || loadPlayer().xHandle || "";
    setHandle(live);
    if (!live) return;

    syncWaitlistFromServer(live);
    fetch(`/api/profile?x=${encodeURIComponent(live)}&wallet=${encodeURIComponent(address || "")}`)
      .then((r) => r.json())
      .then((json) => {
        setProfile(json.profile || null);
        setWaitlistWallet(json.waitlist?.wallet || "");
        const m = json.mismatch;
        if (m?.profileVsWaitlistWallet) setMismatch("PROFILE WALLET AND WAITLIST WALLET DIFFER.");
        else if (m?.connectedVsWaitlistWallet) setMismatch("CONNECTED WALLET IS NOT THE WAITLIST WALLET.");
        else setMismatch("");
      })
      .catch(() => {});
    fetch(`/api/rank?x=${encodeURIComponent(live)}`)
      .then((r) => r.json())
      .then((json) => setRank(json.rank ?? null))
      .catch(() => {});
  }, [address]);

  const official = (profile?.wallet || waitlistWallet || "").toLowerCase();
  const connected = (profile?.connected_wallet || (isConnected ? address : "") || "").toLowerCase();
  const match = official && connected && official === connected;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <SectionTitle title="PROFILE" subtitle="YOUR LAB ID" />

      <div className="mt-8 border border-green/20 bg-black/50 p-5 sm:p-8 panel-border flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">POINTS</p>
            <p className="font-bangers text-4xl text-green text-aura">{profile?.points ?? loadPlayer().points}</p>
          </div>
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">RANK</p>
            <p className="font-bangers text-4xl text-green text-aura">{rank ?? "\u2014"}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 font-tech text-xs tracking-widest">
          <div className="border border-green/20 p-4">
            <p className="text-gray">X</p>
            <p className="text-green mt-2">
              {handle ? (
                <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">@{handle}</a>
              ) : (
                "NOT CONNECTED"
              )}
            </p>
            {!handle && (
              <a href="/api/x/start" className="inline-block mt-3 px-4 py-2 border border-green text-green text-[10px] hover:bg-darkGreen">
                CONNECT X
              </a>
            )}
          </div>
          <div className="border border-green/20 p-4">
            <p className="text-gray">EMAIL</p>
            <p className="text-green mt-2 break-all">{profile?.email || "—"}</p>
          </div>
          <div className="border border-green/20 p-4">
            <p className="text-gray">WAITLIST / PROFILE WALLET</p>
            <p className="text-green mt-2">{official ? formatAddress(official) : "—"}</p>
          </div>
          <div className="border border-green/20 p-4">
            <p className="text-gray">CONNECTED WALLET</p>
            <p className={`mt-2 ${match ? "text-green" : "text-white"}`}>
              {connected ? formatAddress(connected) : "NOT CONNECTED"}
            </p>
          </div>
        </div>

        {mismatch && (
          <p className="font-tech text-[10px] text-red-500 tracking-widest">{mismatch}</p>
        )}
        {official && !match && (
          <p className="font-tech text-[10px] text-green tracking-widest">
            SWITCH EXTENSION TO {formatAddress(official)} THEN CONNECT WALLET.
          </p>
        )}

        {official && (
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray mb-3">CONNECT WALLET</p>
            <ConnectWallet />
          </div>
        )}
      </div>
    </div>
  );
}
