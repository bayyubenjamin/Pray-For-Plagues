"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import WaitlistForm from "@/components/WaitlistForm";
import SocialTasks from "@/components/SocialTasks";
import { TASKS, completeTask, loadPlayer, type PlayerState } from "@/lib/points";
import { saveRef } from "@/lib/referral";
import { syncWaitlistFromServer } from "@/lib/sync-waitlist";
import { getXSession, setXSession } from "@/lib/x-session";

type Row = { rank: number; xHandle: string; wallet: string; points: number };

export default function TaskPage() {
  const [player, setPlayer] = useState<PlayerState>({ completed: [], points: 0 });
  const [rank, setRank] = useState<number | null>(null);
  const [serverPts, setServerPts] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [copied, setCopied] = useState(false);
  const [xMsg, setXMsg] = useState("");

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
    const live = handle || getXSession() || loadPlayer().xHandle;
    if (live) completeTask("connect_x", { xHandle: live });
    setPlayer(loadPlayer());
    syncWaitlistFromServer(live).then(() => setPlayer(loadPlayer()));
  }, []);

  useEffect(() => {
    const x = loadPlayer().xHandle || getXSession();
    fetch(`/api/rank?x=${encodeURIComponent(x)}`)
      .then((r) => r.json())
      .then((json) => {
        setRows(json.rows || []);
        setRank(json.rank ?? null);
        setServerPts(json.points ?? null);
      })
      .catch(() => {});
  }, [player.xHandle, player.points]);

  const handle = player.xHandle || getXSession();
  const doneCount = player.completed.length;
  const maxPts = TASKS.reduce((s, t) => s + t.points, 0);
  const refLink = handle ? `https://prayforplagues.xyz/task?ref=${encodeURIComponent(handle)}` : "";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 pb-24">
      <SectionTitle title="TASK" subtitle="POINTS. SOCIAL. WAITLIST. REF. RANK." />

      <div className="mt-6 border border-green/30 bg-black/70 p-5 panel-border">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">POINTS</p>
            <p className="font-bangers text-4xl text-green text-aura">{serverPts ?? player.points}</p>
          </div>
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">RANK</p>
            <p className="font-bangers text-4xl text-green text-aura">{rank ?? "\u2014"}</p>
          </div>
          <div>
            <p className="font-tech text-[10px] tracking-widest text-gray">TASKS</p>
            <p className="font-bangers text-4xl text-green text-aura">{doneCount}/{TASKS.length}</p>
          </div>
        </div>
      </div>

      <section className="mt-8 border border-green/20 bg-black/50 p-5 panel-border">
        <p className="font-tech text-[10px] tracking-widest text-gray mb-4">WAITLIST</p>
        <WaitlistForm xHandle={handle} hideTaskLink />
      </section>

      <section className="mt-6 border border-green/20 bg-black/50 p-5 panel-border">
        <p className="font-tech text-[10px] tracking-widest text-gray mb-4">SOCIAL TASKS</p>
        {handle ? (
          <p className="font-tech text-green text-sm tracking-widest mb-4">CONNECTED @{handle}</p>
        ) : (
          <a href="/api/x/start" className="inline-block mb-4 px-6 py-3 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen box-aura">
            CONNECT X
          </a>
        )}
        {xMsg && <p className="mb-3 font-tech text-[10px] text-green tracking-widest">{xMsg}</p>}
        <SocialTasks enabled={Boolean(handle)} />
      </section>

      <section className="mt-6 border border-green/20 bg-black/50 p-5 panel-border">
        <p className="font-tech text-[10px] tracking-widest text-gray mb-3">REFERRAL</p>
        {handle ? (
          <button type="button" onClick={() => { navigator.clipboard.writeText(refLink); setCopied(true); }} className="w-full text-left px-4 py-3 border border-green/30 text-green font-tech text-[10px] tracking-widest break-all hover:bg-darkGreen">
            {copied ? "COPIED" : refLink}
          </button>
        ) : (
          <p className="font-tech text-[10px] text-green tracking-widest">CONNECT X TO GET REF LINK.</p>
        )}
      </section>

      <section id="board" className="mt-6 border border-green/20 bg-black/50 panel-border overflow-hidden">
        <p className="font-tech text-[10px] tracking-widest text-gray px-5 pt-5 mb-3">LEADERBOARD</p>
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
                <tr key={row.xHandle} className="border-b border-green/10">
                  <td className={`px-5 py-3 ${row.rank <= 3 ? "text-green" : "text-white"}`}>{row.rank}</td>
                  <td className="px-5 py-3 text-white">@{row.xHandle}</td>
                  <td className="px-5 py-3 text-green">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
