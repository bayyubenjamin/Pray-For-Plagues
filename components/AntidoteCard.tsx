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
}: {
  nft: AntidoteNFT;
  onClick?: () => void;
  actionLabel?: string;
  compact?: boolean;
}) {
  return (
    <div className="panel-border bg-deep/80 p-3 flex flex-col gap-3 relative group hover:bg-darkGreen/50 transition-colors">
      <div className={`${compact ? "aspect-square" : "aspect-[4/5]"} bg-black border border-green/20 relative overflow-hidden flex items-center justify-center`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className={`${compact ? "w-10 h-16" : "w-14 h-20"} border-2 border-green/50 rounded-t-lg rounded-b-md relative flex items-center justify-center shadow-[0_0_15px_rgba(0,200,5,0.3)] bg-darkGreen`}>
          <div className="absolute -top-2 w-6 h-2 bg-gray rounded-sm" />
          <span className="font-bangers text-[10px] text-green rotate-90 tracking-widest">PFP</span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-tech text-green text-xs tracking-widest">#{nft.id}</p>
          <p className="font-tech text-white text-sm">LV {nft.level}</p>
        </div>
        <span className={cn("text-[9px] px-2 py-0.5 border uppercase font-tech tracking-wider", RARITY_COLORS[nft.rarity])}>
          {nft.rarity}
        </span>
      </div>

      {!compact && (
        <div className="flex justify-between text-[10px] font-tech text-gray tracking-widest">
          <span>P {nft.purity.toFixed(0)}</span>
          <span>S {nft.stability.toFixed(0)}</span>
          <span>K {nft.potency.toFixed(0)}</span>
        </div>
      )}

      <button
        onClick={onClick}
        className="w-full py-2 border border-green/50 text-green font-tech uppercase text-[10px] tracking-[0.2em] hover:bg-green hover:text-black transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
}
