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
  actionLabel = "VIEW DETAILS" 
}: { 
  nft: AntidoteNFT; 
  onClick?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="panel-border bg-deep/80 p-4 flex flex-col gap-4 relative group hover:bg-darkGreen/50 transition-colors">
      {/* Image Placeholder (Mocked as a visual asset since we don't have real images) */}
      <div className="aspect-[3/4] bg-black border border-green/20 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-16 h-24 border-2 border-green/50 rounded-t-lg rounded-b-md relative flex items-center justify-center shadow-[0_0_15px_rgba(0,200,5,0.3)] bg-darkGreen">
          <div className="absolute -top-3 w-8 h-3 bg-gray rounded-sm"></div>
          <span className="font-bangers text-xs text-green rotate-90 tracking-widest">PLAGUES</span>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bangers text-xl text-white tracking-widest">PLAGUES ANTIDOTE</h3>
          <p className="font-tech text-green text-sm">LEVEL {nft.level}</p>
        </div>
        <span className={cn("text-[10px] px-2 py-1 border uppercase font-tech font-bold tracking-wider", RARITY_COLORS[nft.rarity])}>
          {nft.rarity}
        </span>
      </div>

      <div className="space-y-3 mt-2">
        <StatBar label="PURITY" value={nft.purity} />
        <StatBar label="STABILITY" value={nft.stability} />
        <StatBar label="POTENCY" value={nft.potency} />
        
        <div className="flex justify-between items-center text-sm font-tech border-t border-green/10 pt-2">
          <span className="text-gray uppercase tracking-widest">DOSE</span>
          <span className="text-green">{nft.dose.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-tech">
          <span className="text-gray uppercase tracking-widest">ID</span>
          <span className="text-white">#{nft.id}</span>
        </div>
      </div>

      <button 
        onClick={onClick}
        className="w-full mt-2 py-3 border border-green/50 text-green font-tech uppercase text-xs tracking-[0.2em] hover:bg-green hover:text-black transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function StatBar({ label, value }: { label: string, value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-tech mb-1">
        <span className="text-gray uppercase tracking-widest">{label}</span>
        <span className="text-white">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full progress-bar-bg relative">
        <div 
          className="absolute top-0 left-0 h-full progress-bar-fill" 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
