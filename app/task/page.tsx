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

function Step({
  num,
  title,
  desc,
  locked,
  lockedNote,
  children,
}: {
  num: string;
  title: string;
  desc: string;
  locked?: boolean;
  lockedNote?: string;
  children: React.ReactNode;
}) {
  return (
    <PanelCard className={locked ? "opacity-70" : ""}>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-bangers text-2xl text-green leading-none shrink-0">{num}</span>
        <h3 className="font-bangers text-2xl text-white tracking-wide leading-none">{title}</h3>
        {locked && (
          <span className="ml-auto shrink-0 px-2 py-0.5 border border-green/30 font-tech text-[10px] tracking-widest text-zinc-400">
            LOCKED
          </span>
        )}
      </div>
      <p className="font-tech text-[11px] tracking-widest text-zinc-400 leading-relaxed mb-5 ml-9">{desc}</p>
      {locked && lockedNote && (
        <p className="font-tech text-[10px] tracking-widest text-zinc-400 mb-4 ml-9">{lockedNote}</p>
      )}
      <div className="ml-0 sm:ml-9">{children}</div>
    </PanelCard>
  );
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
  const tweetText = `Antidote waitlist is live.\n${refLink}\n#prayforplagues #antidote #plagues`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  const joined = Boolean(stats.joined || stats.rank);
  const cls = allowlistClassFromRank(stats.rank, joined);
  const progress = stats.taskMax > 0 ? Math.min(100, Math.round((stats.taskDone / stats.taskMax) * 100)) : 0;

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

      <div className="card-panel p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-tech text-[10px] tracking-[0.25em] text-white/55">YOUR PROGRESS</p>
          <p className="font-tech text-[10px] tracking-widest text-green">{progress}%</p>
        </div>
        <div className="mt-3 h-1.5 progress-bar-bg">
          <div className="h-full progress-bar-fill transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 font-tech text-[10px] tracking-widest text-zinc-400">
          {stats.taskDone} OF {stats.taskMax} TASKS DONE
          {joined ? " — YOU ARE ON THE WAITLIST" : " — FINISH THE STEPS BELOW TO JOIN"}
        </p>
      </div>

      <MintClassCard rank={stats.rank} joined={joined} points={stats.points} />

      <Step
        num="01"
        title="CONNECT X"
        desc="LINK YOUR X ACCOUNT. EVERYTHING ELSE UNLOCKS FROM HERE."
      >
        {handle ? (
          <div className="flex flex-col gap-2">
            <p className="font-tech text-green text-sm tracking-widest">CONNECTED @{handle}</p>
            {xMsg && <p className="font-tech text-[10px] text-green tracking-widest">{xMsg}</p>}
            <p className="font-tech text-[10px] tracking-widest text-zinc-400">STEPS 02 AND 03 ARE OPEN.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <a href="/api/x/start" className="inline-block px-6 py-3 border border-green text-green font-tech text-xs tracking-widest text-center hover:bg-darkGreen box-aura">
              CONNECT X
            </a>
            <p className="font-tech text-[10px] tracking-widest text-zinc-400">ONE X = ONE WALLET = ONE EMAIL.</p>
          </div>
        )}
      </Step>

      <Step
        num="02"
        title="SOCIAL TASKS"
        desc="FOLLOW, LIKE, REPOST, COMMENT. EACH ONE OPENS X AND CHECKS AFTER 10 SECONDS."
        locked={!handle}
        lockedNote="CONNECT X IN STEP 01 TO START."
      >
        <SocialTasks enabled={Boolean(handle)} />
      </Step>

      <Step
        num="03"
        title="JOIN WAITLIST"
        desc="PASTE YOUR WALLET AND EMAIL. LOCKED AFTER YOU JOIN — NO CHANGES."
        locked={!handle}
        lockedNote="CONNECT X IN STEP 01 TO JOIN."
      >
        <WaitlistForm xHandle={handle} hideTaskLink hideSocialTasks />
      </Step>

      <Step
        num="04"
        title="REFER + CLIMB"
        desc="SHARE YOUR LINK. EACH VALID REFERRAL IS +200 POINTS FOR YOUR INVITER RANK."
        locked={!joined}
        lockedNote="JOIN THE WAITLIST IN STEP 03 TO GET YOUR LINK."
      >
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border border-green/20 p-3">
            <p className="font-tech text-[10px] text-zinc-400 tracking-widest">VALID</p>
            <p className="font-bangers text-2xl text-green text-aura leading-none mt-1">{stats.refValid}</p>
          </div>
          <div className="border border-green/20 p-3">
            <p className="font-tech text-[10px] text-zinc-400 tracking-widest">PENDING</p>
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
              SHARE ON X
            </a>
          </div>
        ) : (
          <p className="font-tech text-[10px] text-green tracking-widest">CONNECT X TO GET REF LINK.</p>
        )}
      </Step>

      <PanelCard title="LEADERBOARD" id="board" className="overflow-hidden p-0 sm:p-0">
        <p className="font-tech text-[10px] tracking-widest text-zinc-400 px-5 pt-5 mb-3">TOP 10 · OPENSEA WINDOWS · 1–50 PATIENT ZERO · 51–250 QUARANTINE</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tech">
            <thead>
              <tr className="border-y border-green/20 text-zinc-400 text-[10px] tracking-widest">
                <th className="px-5 py-3">RANK</th>
                <th className="px-5 py-3">X</th>
                <th className="px-5 py-3">POINTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-6 text-zinc-400 text-[10px] tracking-widest">NO RANKS YET — BE THE FIRST TO JOIN THE WAITLIST</td></tr>
              )}
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.xHandle}`} className="border-b border-green/10 hover:bg-green/5 transition-colors">
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
