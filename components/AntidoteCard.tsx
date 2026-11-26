import Image from "next/image";
import { AntidoteNFT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RARITY_SPECS } from "@/lib/protocol";

const RARITY_COLORS = {
  COMMON: "text-zinc-400 border-gray/30",
  RARE: "text-blue-400 border-blue-400/30",
  EPIC: "text-purple-500 border-purple-500/30",
  LEGENDARY: "text-yellow-500 border-yellow-500/30",
  MYTHIC: "text-red-500 border-red-500/30",
};

export default function AntidoteCard({
  nft,
  soon = false,
  briefing = false,
  onSelect,
}: {
  nft: AntidoteNFT;
  soon?: boolean;
  briefing?: boolean;
  onSelect?: (nft: AntidoteNFT) => void;
}) {
  const spec = RARITY_SPECS.find((s) => s.rarity === nft.rarity);
  const dim = soon && !briefing;
  const caption = spec?.line || spec?.perk || "";

  return (
    <article
      onClick={() => onSelect?.(nft)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(nft);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${nft.rarity} vial #${nft.id}, view details`}
      className="card-panel card-lift panel-border p-3 flex flex-col gap-3 relative group cursor-pointer focus-visible:outline-none"
    >
      <div className="aspect-[2/3] bg-black border border-green/20 relative overflow-hidden transition-colors duration-300 group-hover:border-green/50">
        {spec?.image && (
          <Image
            src={spec.image}
            alt={`${nft.rarity} antidote vial`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className={`object-cover transition-all duration-300 group-hover:scale-[1.03] ${dim ? "blur-sm opacity-40" : ""}`}
          />
        )}
        {dim && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
            <span className="font-bangers text-2xl sm:text-3xl text-green text-aura tracking-widest">EMPTY</span>
          </div>
        )}
      </div>

      <div className={`flex items-start justify-between gap-2 ${dim ? "blur-[2px] opacity-50" : ""}`}>
        <div>
          <p className="font-tech text-green text-xs tracking-widest">#{nft.id}</p>
          <p className="font-tech text-white text-sm">LV {nft.level}</p>
        </div>
        <span className={cn("text-[10px] px-2 py-0.5 border uppercase font-tech tracking-wider", RARITY_COLORS[nft.rarity])}>
          {nft.rarity}
        </span>
      </div>

      {briefing && caption && (
        <p className="font-tech text-xs leading-relaxed text-zinc-300">{caption}</p>
      )}

      <span className="mt-auto block w-full py-2.5 border border-green/30 text-green font-tech uppercase text-xs tracking-[0.2em] text-center group-hover:bg-darkGreen transition-colors">
        VIEW DETAILS
      </span>
    </article>
  );
}
