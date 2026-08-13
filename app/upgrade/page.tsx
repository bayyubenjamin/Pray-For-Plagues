"use client";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/SectionTitle";
import { MOCK_NFTS } from "@/lib/mockData";
import { mockUpgradeTransaction } from "@/lib/mockBlockchain";
import { AntidoteNFT } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UpgradeContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  
  const [selectedNFT, setSelectedNFT] = useState<AntidoteNFT | null>(null);
  const [status, setStatus] = useState<"idle" | "upgrading" | "success">("idle");
  
  useEffect(() => {
    // Default to first NFT if none provided via URL
    const targetId = idParam ? parseInt(idParam) : MOCK_NFTS[0].id;
    const nft = MOCK_NFTS.find(n => n.id === targetId) || MOCK_NFTS[0];
    setSelectedNFT(nft);
  }, [idParam]);

  const handleUpgrade = async () => {
    if (!selectedNFT || status === "upgrading") return;
    
    setStatus("upgrading");
    const success = await mockUpgradeTransaction(selectedNFT.id);
    
    if (success) {
      setStatus("success");
      // Simulate level up visually
      setSelectedNFT(prev => prev ? {
        ...prev,
        level: prev.level + 1,
        purity: Math.min(100, prev.purity + 12.6),
        stability: Math.min(100, prev.stability + 10.2),
        potency: Math.min(100, prev.potency + 15.3),
        dose: prev.dose + 1
      } : null);
      
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (!selectedNFT) return <div className="text-center py-20 font-tech text-green">LOADING LAB EQUIPMENT...</div>;

  const cost = selectedNFT.level * 500;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SectionTitle title="UPGRADE ANTIDOTE" subtitle="POWER UP YOUR ANTIDOTE USING $PLAGUES" />

      <div className="grid md:grid-cols-2 gap-8 mt-12 bg-deep/80 panel-border p-8 relative">
        {/* Visualizer */}
        <div className="flex flex-col items-center justify-center border border-green/10 bg-black p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green/20 via-transparent to-transparent"></div>
          {status === "upgrading" && (
            <div className="absolute inset-0 bg-green/10 animate-pulse mix-blend-screen z-10"></div>
          )}
          <div className={`w-32 h-48 border-4 border-green/60 rounded-t-xl rounded-b-lg relative flex items-center justify-center shadow-[0_0_40px_rgba(0,200,5,0.3)] bg-darkGreen z-20 ${status === 'upgrading' ? 'animate-bounce' : ''}`}>
             <div className="absolute -top-4 w-12 h-4 bg-gray rounded-sm"></div>
             <span className="font-bangers text-2xl text-green rotate-90 tracking-widest">PLAGUES</span>
          </div>
          <div className="mt-8 text-center relative z-20">
            <h3 className="font-bangers text-3xl text-white tracking-widest">PLAGUES ANTIDOTE</h3>
            <p className="font-tech text-green text-lg">LEVEL {selectedNFT.level}</p>
            <p className="font-tech text-gray text-sm mt-1 uppercase tracking-widest">#{selectedNFT.id}</p>
          </div>
        </div>

        {/* Upgrade Panel */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6 font-tech">
            <UpgradeStat label="PURITY" current={selectedNFT.purity} boost={12.6} isPercentage />
            <UpgradeStat label="STABILITY" current={selectedNFT.stability} boost={10.2} isPercentage />
            <UpgradeStat label="POTENCY" current={selectedNFT.potency} boost={15.3} isPercentage />
            
            <div className="flex justify-between items-center border-b border-green/10 pb-4">
              <span className="text-gray uppercase tracking-widest">DOSE</span>
              <div className="flex items-center gap-4">
                <span className="text-white">{selectedNFT.dose.toString().padStart(2, '0')}</span>
                <span className="text-green">→</span>
                <span className="text-green font-bold">{(selectedNFT.dose + 1).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-green/20">
            <div className="flex justify-between items-center mb-6 font-tech">
              <span className="text-gray uppercase tracking-widest">COST</span>
              <span className="text-green text-xl flex items-center gap-2">
                ☣ {cost} $PLAGUES
              </span>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={status !== "idle"}
              className={`w-full py-4 font-tech text-xl tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(0,200,5,0.2)] ${
                status === "idle" 
                  ? "bg-green text-black hover:bg-green-bright hover:shadow-[0_0_25px_rgba(0,200,5,0.6)]" 
                  : status === "upgrading"
                  ? "bg-darkGreen text-green border border-green cursor-not-allowed"
                  : "bg-black text-green border border-green"
              }`}
            >
              {status === "idle" && "UPGRADE"}
              {status === "upgrading" && "UPGRADING ANTIDOTE..."}
              {status === "success" && "UPGRADE SUCCESSFUL"}
            </button>
            <p className="text-center font-tech text-gray text-xs mt-4 tracking-widest uppercase">
              UPGRADING IS PERMANENT.<br/>THE PLAGUE REWARDS THE STRONG.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-tech text-green">LOADING...</div>}>
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeStat({ label, current, boost, isPercentage = false }: { label: string, current: number, boost: number, isPercentage?: boolean }) {
  const next = Math.min(100, current + boost);
  return (
    <div className="flex justify-between items-center border-b border-green/10 pb-4">
      <span className="text-gray uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-white w-16 text-right">{current.toFixed(1)}{isPercentage ? "%" : ""}</span>
        <span className="text-green">→</span>
        <span className="text-white w-16 text-left">{next.toFixed(1)}{isPercentage ? "%" : ""}</span>
        <span className="text-green text-xs bg-darkGreen px-2 py-1 rounded-sm border border-green/30">+{boost.toFixed(1)}</span>
      </div>
    </div>
  );
}
