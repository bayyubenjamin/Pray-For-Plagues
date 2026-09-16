import Link from "next/link";
import { PHASES } from "@/lib/protocol";

const STATUS_CLASS = {
  LIVE: "border-green text-green bg-green/10",
  NEXT: "border-yellow-500/60 text-yellow-500",
  LOCKED: "border-green/20 text-gray",
};

export default function ProtocolRoadmap({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {PHASES.map((phase) => (
        <article key={phase.code} className="card-panel p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-tech text-[10px] tracking-widest text-gray">PHASE {phase.id}</p>
            <span className={`px-2 py-0.5 border font-tech text-[9px] tracking-widest ${STATUS_CLASS[phase.status]}`}>
              {phase.status}
            </span>
          </div>
          <h3 className="font-bangers text-2xl text-green tracking-wide leading-none">{phase.code}</h3>
          {!compact && (
            <>
              <p className="font-tech text-[10px] tracking-widest text-white">{phase.title}</p>
              <p className="font-tech text-[11px] leading-relaxed text-gray">{phase.blurb}</p>
            </>
          )}
          {phase.status === "LIVE" && (
            <Link href="/task" className="mt-auto pt-1 font-tech text-[10px] tracking-widest text-green hover:text-green-bright">
              ENTER CONTAGION →
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
