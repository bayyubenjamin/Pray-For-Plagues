"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import ConnectWallet from "@/components/ConnectWallet";
import PanelCard from "@/components/PanelCard";
import MintClassCard from "@/components/MintClassCard";
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

type Stats = {
  points: number;
  rank: number | null;
  taskDone: number;
  taskMax: number;
  refValid: number;
  refPending: number;
  joined?: boolean;
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [waitlistWallet, setWaitlistWallet] = useState("");
  const [stats, setStats] = useState<Stats>({
    points: 0,
    rank: null,
    taskDone: 0,
    taskMax: 5,
    refValid: 0,
    refPending: 0,
    joined: false,
  });
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
    fetch(`/api/stats?x=${encodeURIComponent(live)}`)
      .then((r) => r.json())
      .then((json) => setStats(json))
      .catch(() => {});
  }, [address]);

  const official = (profile?.wallet || waitlistWallet || "").toLowerCase();
  const connected = (profile?.connected_wallet || (isConnected ? address : "") || "").toLowerCase();
  const match = official && connected && official === connected;
  const joined = Boolean(stats.joined || stats.rank || profile?.email || waitlistWallet);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 flex flex-col gap-4">
      <SectionTitle title="PROFILE" subtitle="YOUR LAB ID" />

      <div className="grid grid-cols-3 gap-2">
        <PanelCard title="POINTS" compact>
          <p className="font-bangers text-2xl sm:text-3xl text-green text-aura leading-none">{stats.points}</p>
        </PanelCard>
        <PanelCard title="RANK" compact>
          <p className="font-bangers text-2xl sm:text-3xl text-green text-aura leading-none">{stats.rank ?? "\u2014"}</p>
        </PanelCard>
        <PanelCard title="TASK" compact>
          <p className="font-bangers text-2xl sm:text-3xl text-green text-aura leading-none">
            {stats.taskDone}/{stats.taskMax}
          </p>
        </PanelCard>
      </div>

      <MintClassCard rank={stats.rank} joined={joined} points={stats.points} />

      <PanelCard title="REFERRAL" compact>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-tech text-[9px] text-gray tracking-widest">VALID</p>
            <p className="font-bangers text-2xl text-green text-aura leading-none">{stats.refValid}</p>
          </div>
          <div>
            <p className="font-tech text-[9px] text-gray tracking-widest">PENDING</p>
            <p className="font-bangers text-2xl text-green text-aura leading-none">{stats.refPending}</p>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="X">
        <p className="font-tech text-sm text-green tracking-widest">
          {handle ? (
            <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">@{handle}</a>
          ) : (
            "NOT CONNECTED"
          )}
        </p>
        {!handle && (
          <a href="/api/x/start" className="inline-block mt-3 px-4 py-2 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen">
            CONNECT X
          </a>
        )}
      </PanelCard>

      <PanelCard title="EMAIL">
        <p className="font-tech text-sm text-green tracking-widest break-all">{profile?.email || "\u2014"}</p>
      </PanelCard>

      <PanelCard title="PROFILE WALLET">
        <p className="font-tech text-sm text-green tracking-widest">{official ? formatAddress(official) : "\u2014"}</p>
      </PanelCard>

      <PanelCard title="CONNECTED WALLET">
        <p className={`font-tech text-sm tracking-widest ${match ? "text-green" : "text-white"}`}>
          {connected ? formatAddress(connected) : "NOT CONNECTED"}
        </p>
        {mismatch && <p className="mt-3 font-tech text-[10px] text-red-500 tracking-widest">{mismatch}</p>}
        {official && !match && (
          <p className="mt-3 font-tech text-[10px] text-green tracking-widest">
            SWITCH EXTENSION TO {formatAddress(official)}
          </p>
        )}
        {official && (
          <div className="mt-4">
            <ConnectWallet />
          </div>
        )}
      </PanelCard>
    </div>
  );
}
