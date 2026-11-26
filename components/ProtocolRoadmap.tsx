import Link from "next/link";
import { PHASES } from "@/lib/protocol";

const STATUS_CLASS = {
  LIVE: "border-green text-green bg-green/10",
  NEXT: "border-yellow-500/60 text-yellow-500",
  LOCKED: "border-green/20 text-zinc-400",
};

export default function ProtocolRoadmap({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {PHASES.map((phase) => (
        <article key={phase.code} className="card-panel card-lift p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-tech text-xs tracking-widest text-zinc-400">PHASE {phase.id}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border font-tech text-[10px] tracking-widest ${STATUS_CLASS[phase.status]}`}>
              {phase.status === "LIVE" && (
                <span aria-hidden="true" className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-green-bright" />
              )}
              {phase.status}
            </span>
          </div>
          <h3 className="font-bangers text-2xl text-green tracking-wide leading-none">{phase.code}</h3>
          {!compact && (
            <>
              <p className="font-tech text-xs tracking-widest text-white">{phase.title}</p>
              <p className="font-tech text-xs leading-relaxed text-white/70">{phase.blurb}</p>
            </>
          )}
          {phase.status === "LIVE" && (
            <Link href="/task" className="mt-auto pt-1 font-tech text-xs tracking-widest text-green hover:text-green-bright transition-colors">
              OPEN WAITLIST →
            </Link>
          )}
          {phase.code === "MUTATION" && (
            <Link href="/inventory" className="mt-auto pt-1 font-tech text-xs tracking-widest text-green hover:text-green-bright transition-colors">
              INVENTORY →
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
