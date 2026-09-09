"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import { loadPlayer } from "@/lib/points";

type Row = { rank: number; xHandle: string; wallet: string; points: number };

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [mine, setMine] = useState<number | null>(null);

  useEffect(() => {
    const x = loadPlayer().xHandle || "";
    fetch(`/api/rank?x=${encodeURIComponent(x)}`)
      .then((r) => r.json())
      .then((json) => {
        setRows(json.rows || []);
        setMine(json.rank ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SectionTitle title="RANK" subtitle="SORTED BY POINTS" />
      {mine && (
        <p className="font-tech text-green text-xs tracking-widest mb-6">YOUR RANK #{mine}</p>
      )}

      <div className="panel-border bg-deep/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tech">
            <thead>
              <tr className="border-b border-green/30 bg-darkGreen text-gray text-xs tracking-widest uppercase">
                <th className="px-6 py-4">RANK</th>
                <th className="px-6 py-4">X</th>
                <th className="px-6 py-4">WALLET</th>
                <th className="px-6 py-4">POINTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-gray text-xs tracking-widest">
                    NO RANKS YET. JOIN WAITLIST TO APPEAR.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={`${row.xHandle}-${row.wallet}`} className="border-b border-green/10 hover:bg-darkGreen/50">
                  <td className={`px-6 py-4 text-lg ${row.rank <= 3 ? "text-green font-bold text-glow" : "text-white"}`}>
                    {row.rank}
                  </td>
                  <td className="px-6 py-4 text-white tracking-widest">@{row.xHandle}</td>
                  <td className="px-6 py-4 text-gray text-xs">
                    {row.wallet.slice(0, 6)}...{row.wallet.slice(-4)}
                  </td>
                  <td className="px-6 py-4 text-green">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
