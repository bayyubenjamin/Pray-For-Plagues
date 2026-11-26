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

function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`shrink-0 px-2 py-0.5 border font-tech text-[10px] tracking-widest ${
        ok ? "border-green/40 text-green" : "border-zinc-600 text-zinc-400"
      }`}
    >
      {label}
    </span>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [waitlistWallet, setWaitlistWallet] = useState("");
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [mismatch, setMismatch] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

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
      .then((r) => {
        if (r.status === 401) setSessionExpired(true);
        return r.json();
      })
      .then((json) => {
        setProfile(json.profile || null);
        setWaitlistWallet(json.waitlist?.wallet || "");
        setJoinedAt(json.joinedAt || null);
        const m = json.mismatch;
        if (m?.profileVsWaitlistWallet) setMismatch("PROFILE WALLET AND WAITLIST WALLET DIFFER.");
        else if (m?.connectedVsWaitlistWallet) setMismatch("CONNECTED WALLET IS NOT THE WAITLIST WALLET.");
        else setMismatch("");
      })
      .catch(() => {});
    fetch(`/api/rank?x=${encodeURIComponent(live)}`)
      .then((r) => r.json())
      .then((json) => setRank(typeof json.rank === "number" ? json.rank : null))
      .catch(() => {});
  }, [address]);

  const official = (profile?.wallet || waitlistWallet || "").toLowerCase();
  const connected = (profile?.connected_wallet || (isConnected ? address : "") || "").toLowerCase();
  const match = official && connected && official === connected;
  const joined = Boolean(profile?.email || waitlistWallet || rank !== null);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 flex flex-col gap-4">
      <SectionTitle title="PROFILE" subtitle="YOUR LAB ID — POINTS AND RANK LIVE ON TASK" />

      {sessionExpired && (
        <div className="card-panel p-4 border border-amber-400/40">
          <p className="font-tech text-[11px] tracking-widest text-amber-300">SESSION EXPIRED — RECONNECT X TO SEE YOUR PROFILE</p>
          <a
            href="/api/x/start"
            className="inline-block mt-3 px-4 py-2 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen"
          >
            RECONNECT X
          </a>
        </div>
      )}

      <PanelCard title="LAB ID">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bangers text-3xl text-green text-aura leading-none">
            {handle ? `@${handle}` : "NO HANDLE"}
          </p>
          <StatusBadge ok={joined} label={joined ? "ON WAITLIST" : "NOT JOINED"} />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-tech text-[10px] tracking-widest text-zinc-400">MEMBER SINCE</span>
            <span className="font-tech text-[11px] tracking-widest text-white">{joinedAt ? fmtDate(joinedAt) : "—"}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-tech text-[10px] tracking-widest text-zinc-400">RANK</span>
            <span className="font-tech text-[11px] tracking-widest text-white">{rank !== null ? `#${rank}` : "—"}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-tech text-[10px] tracking-widest text-zinc-400">CHAIN</span>
            <span className="font-tech text-[11px] tracking-widest text-white">ROBINHOOD · 4663</span>
          </div>
        </div>
      </PanelCard>

      <MintClassCard rank={rank} joined={joined} />

      <PanelCard title="ACCOUNT">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-tech text-[10px] tracking-widest text-zinc-400">X ACCOUNT</span>
              <StatusBadge ok={Boolean(handle)} label={handle ? "CONNECTED" : "NOT CONNECTED"} />
            </div>
            <p className="mt-1 font-tech text-sm text-green tracking-widest">
              {handle ? (
                <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">@{handle}</a>
              ) : (
                "—"
              )}
            </p>
            {!handle && (
              <a href="/api/x/start" className="inline-block mt-3 px-4 py-2 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen">
                CONNECT X
              </a>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-tech text-[10px] tracking-widest text-zinc-400">EMAIL</span>
              <StatusBadge ok={Boolean(profile?.email)} label={profile?.email ? "ON FILE" : "NOT SET"} />
            </div>
            <p className="mt-1 font-tech text-sm text-green tracking-widest break-all">
              {profile?.email || "NOT JOINED YET — JOIN THE WAITLIST ON TASK"}
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-tech text-[10px] tracking-widest text-zinc-400">PROFILE WALLET</span>
              <StatusBadge ok={Boolean(official)} label={official ? "SET" : "NOT SET"} />
            </div>
            <p className="mt-1 font-tech text-sm text-green tracking-widest">{official ? formatAddress(official) : "—"}</p>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-tech text-[10px] tracking-widest text-zinc-400">CONNECTED WALLET</span>
              <StatusBadge ok={Boolean(match)} label={match ? "MATCH" : connected ? "MISMATCH" : "NOT CONNECTED"} />
            </div>
            <p className={`mt-1 font-tech text-sm tracking-widest ${match ? "text-green" : "text-white"}`}>
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
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
