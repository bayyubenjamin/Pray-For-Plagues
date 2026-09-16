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
    <PanelCard title="OPENSEA WINDOW">
      <p className="font-bangers text-3xl text-green text-aura leading-none">{cls.label}</p>
      <p className="mt-2 font-tech text-[10px] tracking-widest text-white">{cls.window}</p>
      <p className="mt-3 font-tech text-[11px] leading-relaxed text-gray">{cls.hint}</p>
      {typeof points === "number" && (
        <p className="mt-3 font-tech text-[10px] tracking-widest text-green">WAITLIST POINTS {points}</p>
      )}
      {cls.id === "UNLISTED" && (
        <Link href="/task" className="inline-block mt-4 px-4 py-2 border border-green text-green font-tech text-[10px] tracking-widest hover:bg-darkGreen">
          JOIN WAITLIST
        </Link>
      )}
    </PanelCard>
  );
}
