"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import WaitlistForm from "@/components/WaitlistForm";
import SocialTasks from "@/components/SocialTasks";
import PanelCard from "@/components/PanelCard";
import MintClassCard from "@/components/MintClassCard";
import { completeTask, loadPlayer, type PlayerState } from "@/lib/points";
import { saveRef } from "@/lib/referral";
import { syncWaitlistFromServer } from "@/lib/sync-waitlist";
import { getXSession, setXSession } from "@/lib/x-session";
import { allowlistClassFromRank } from "@/lib/protocol";

type Row = { rank: number; xHandle: string; points: number; mine?: boolean };
type Stats = {
  points: number;
  rank: number | null;
  taskDone: number;
  taskMax: number;
  refValid: number;
  refPending: number;
  joined?: boolean;
};

function liveHandle() {
  return getXSession() || loadPlayer().xHandle || "";
}

export default function TaskPage() {
  const [player, setPlayer] = useState<PlayerState>({ completed: [], points: 0 });
  const [stats, setStats] = useState<Stats>({
    points: 0,
    rank: null,
    taskDone: 0,
    taskMax: 5,
    refValid: 0,
    refPending: 0,
    joined: false,
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [copied, setCopied] = useState(false);
  const [xMsg, setXMsg] = useState("");

  const loadHud = (x: string) => {
    if (!x) return;
    fetch(`/api/rank?x=${encodeURIComponent(x)}`)
      .then((r) => r.json())
      .then((json) => {
        setRows(json.rows || []);
        setStats((prev) => ({
          ...prev,
          points: json.points ?? prev.points,
          rank: json.rank ?? prev.rank,
          joined: Boolean(json.rank) || prev.joined,
        }));
      })
      .catch(() => {});
    fetch(`/api/stats?x=${encodeURIComponent(x)}`)
      .then((r) => r.json())
      .then((json) => setStats((prev) => ({ ...prev, ...json })))
      .catch(() => {});
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) saveRef(ref);
    const x = params.get("x");
    const handle = params.get("handle");
    if (x === "connected" && handle) {
      setXSession(handle);
      completeTask("connect_x", { xHandle: handle });
      setXMsg("X CONNECTED");
      window.history.replaceState({}, "", "/task");
    }
    const live = handle || liveHandle();
    if (live) completeTask("connect_x", { xHandle: live });
    setPlayer(loadPlayer());
    loadHud(live);
    syncWaitlistFromServer(live).then(() => {
      setPlayer(loadPlayer());
      loadHud(liveHandle() || live);
    });
    const onJoin = () => loadHud(liveHandle());
    window.addEventListener("pfp-waitlist", onJoin);
    return () => window.removeEventListener("pfp-waitlist", onJoin);
  }, []);

  const handle = player.xHandle || getXSession();
  const refLink = handle ? `https://prayforplagues.xyz/task?ref=${encodeURIComponent(handle)}` : "";
  const tweetText = `\u{1F9A0}\u{1F9EA} Antidote waitlist is live.\n${refLink}\n#prayforplagues #antidote #plagues`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  const joined = Boolean(stats.joined || stats.rank);
  const cls = allowlistClassFromRank(stats.rank, joined);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 pb-24 flex flex-col gap-4">
      <SectionTitle title="TASK" subtitle="WAITLIST FOR OPENSEA. NOT INVENTORY." />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
        <PanelCard title="WINDOW" compact>
          <p className="font-bangers text-lg sm:text-xl text-green text-aura leading-none">{cls.label}</p>
        </PanelCard>
      </div>

      <MintClassCard rank={stats.rank} joined={joined} points={stats.points} />

      <PanelCard title="WAITLIST">
        <WaitlistForm xHandle={handle} hideTaskLink />
      </PanelCard>

      <PanelCard title="SOCIAL TASKS">
        {handle ? (
          <p className="font-tech text-green text-sm tracking-widest mb-4">CONNECTED @{handle}</p>
        ) : (
          <a href="/api/x/start" className="inline-block mb-4 px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen box-aura">
            CONNECT X
          </a>
        )}
        {xMsg && <p className="mb-3 font-tech text-[10px] text-green tracking-widest">{xMsg}</p>}
        <SocialTasks enabled={Boolean(handle)} />
      </PanelCard>

      <PanelCard title="REFERRAL">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border border-green/20 p-3">
            <p className="font-tech text-[9px] text-gray tracking-widest">VALID</p>
            <p className="font-bangers text-2xl text-green text-aura leading-none mt-1">{stats.refValid}</p>
          </div>
          <div className="border border-green/20 p-3">
            <p className="font-tech text-[9px] text-gray tracking-widest">PENDING</p>
            <p className="font-bangers text-2xl text-green text-aura leading-none mt-1">{stats.refPending}</p>
          </div>
        </div>
        {handle ? (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => { navigator.clipboard.writeText(refLink); setCopied(true); }} className="w-full text-left px-4 py-3 border border-green/30 text-green font-tech text-[10px] tracking-widest break-all hover:bg-darkGreen">
              {copied ? "COPIED" : refLink}
            </button>
            <a
              href={tweetHref}
              target="_blank"
              rel="noreferrer"
              className="w-full px-4 py-3 bg-green text-black font-tech text-xs tracking-widest text-center hover:bg-green-bright"
            >
              TWEET
            </a>
          </div>
        ) : (
          <p className="font-tech text-[10px] text-green tracking-widest">CONNECT X TO GET REF LINK.</p>
        )}
      </PanelCard>

      <PanelCard title="LEADERBOARD" id="board" className="overflow-hidden p-0 sm:p-0">
        <p className="font-tech text-[10px] tracking-widest text-gray px-5 pt-5 mb-3">TOP 10 · OPENSEA WINDOWS · 1–50 PATIENT ZERO · 51–250 QUARANTINE</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tech">
            <thead>
              <tr className="border-y border-green/20 text-gray text-[10px] tracking-widest">
                <th className="px-5 py-3">RANK</th>
                <th className="px-5 py-3">X</th>
                <th className="px-5 py-3">POINTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-6 text-gray text-[10px] tracking-widest">NO RANKS YET</td></tr>
              )}
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.xHandle}`} className="border-b border-green/10">
                  <td className={`px-5 py-3 ${row.rank <= 3 ? "text-green" : "text-white"}`}>{row.rank}</td>
                  <td className={`px-5 py-3 ${row.mine ? "text-green" : "text-white"}`}>{row.xHandle}</td>
                  <td className="px-5 py-3 text-green">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
