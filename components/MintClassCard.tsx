import Link from "next/link";
import PanelCard from "@/components/PanelCard";
import { allowlistClassFromRank } from "@/lib/protocol";

export default function MintClassCard({
  rank,
  joined,
  points,
}: {
  rank: number | null;
  joined: boolean;
  points?: number;
}) {
  const cls = allowlistClassFromRank(rank, joined);
  return (
    <PanelCard title="OPENSEA WINDOW" className="card-lift">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bangers text-3xl text-green text-aura leading-none">{cls.label}</p>
        {rank !== null && joined && (
          <span className="shrink-0 px-2 py-1 border border-green/40 font-tech text-[10px] tracking-widest text-green">
            RANK #{rank}
          </span>
        )}
      </div>
      <p className="mt-2 font-tech text-[10px] tracking-widest text-white">{cls.window}</p>
      <p className="mt-3 font-tech text-[11px] leading-relaxed text-white/70">{cls.hint}</p>
      {typeof points === "number" && (
        <p className="mt-3 font-tech text-[10px] tracking-widest text-green">
          WAITLIST POINTS <span className="font-bold">{points}</span>
        </p>
      )}
      {cls.id === "UNLISTED" && (
        <Link href="/task" className="inline-block mt-4 px-4 py-2 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen transition-colors">
          JOIN WAITLIST
        </Link>
      )}
    </PanelCard>
  );
}
