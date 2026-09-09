import { AntidoteNFT } from "@/lib/types";
import { cn } from "@/lib/utils";

const RARITY_COLORS = {
  COMMON: "text-gray border-gray/30",
  RARE: "text-blue-400 border-blue-400/30",
  EPIC: "text-purple-500 border-purple-500/30",
  LEGENDARY: "text-yellow-500 border-yellow-500/30",
  MYTHIC: "text-red-500 border-red-500/30",
};

export default function AntidoteCard({
  nft,
  onClick,
  actionLabel = "VIEW",
  compact = false,
  soon = false,
}: {
  nft: AntidoteNFT;
  onClick?: () => void;
  actionLabel?: string;
  compact?: boolean;
  soon?: boolean;
}) {
  return (
    <div className="panel-border bg-deep/80 p-3 flex flex-col gap-3 relative">
      <div className={`${compact ? "aspect-square" : "aspect-[4/5]"} bg-black border border-green/20 relative overflow-hidden flex items-center justify-center`}>
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green/10 via-transparent to-transparent ${soon ? "blur-md" : ""}`} />
        <div className={`${compact ? "w-10 h-16" : "w-14 h-20"} border-2 border-green/50 rounded-t-lg rounded-b-md relative flex items-center justify-center shadow-[0_0_15px_rgba(0,200,5,0.3)] bg-darkGreen ${soon ? "blur-sm opacity-40" : ""}`}>
          <div className="absolute -top-2 w-6 h-2 bg-gray rounded-sm" />
          <span className="font-bangers text-[10px] text-green rotate-90 tracking-widest">PFP</span>
        </div>
        {soon && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55">
            <span className="font-bangers text-2xl sm:text-3xl text-green text-aura tracking-widest">SOON</span>
          </div>
        )}
      </div>

      <div className={`flex items-start justify-between gap-2 ${soon ? "blur-[2px] opacity-50" : ""}`}>
        <div>
          <p className="font-tech text-green text-xs tracking-widest">#{nft.id}</p>
          <p className="font-tech text-white text-sm">LV {nft.level}</p>
        </div>
        <span className={cn("text-[9px] px-2 py-0.5 border uppercase font-tech tracking-wider", RARITY_COLORS[nft.rarity])}>
          {nft.rarity}
        </span>
      </div>

      <button
        type="button"
        disabled
        className="w-full py-2 border border-green/30 text-gray font-tech uppercase text-[10px] tracking-[0.2em] cursor-not-allowed opacity-50"
      >
        SOON
      </button>
    </div>
  );
}
