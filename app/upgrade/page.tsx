"use client";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/SectionTitle";
import { MOCK_NFTS } from "@/lib/mockData";
import { mockUpgradeTransaction } from "@/lib/mockBlockchain";
import { AntidoteNFT } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { completeTask } from "@/lib/points";

function UpgradeContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [selectedNFT, setSelectedNFT] = useState<AntidoteNFT | null>(null);
  const [status, setStatus] = useState<"idle" | "upgrading" | "success">("idle");

  useEffect(() => {
    completeTask("visit_lab");
    const targetId = idParam ? parseInt(idParam) : MOCK_NFTS[0].id;
    const nft = MOCK_NFTS.find((n) => n.id === targetId) || MOCK_NFTS[0];
    setSelectedNFT(nft);
  }, [idParam]);

  const handleUpgrade = async () => {
    if (!selectedNFT || status === "upgrading") return;
    setStatus("upgrading");
    const success = await mockUpgradeTransaction(selectedNFT.id);
    if (success) {
      setStatus("success");
      setSelectedNFT((prev) =>
        prev
          ? {
              ...prev,
              level: prev.level + 1,
              purity: Math.min(100, prev.purity + 12.6),
              stability: Math.min(100, prev.stability + 10.2),
              potency: Math.min(100, prev.potency + 15.3),
              dose: prev.dose + 1,
            }
          : null
      );
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (!selectedNFT) return <div className="text-center py-20 font-tech text-green">LOADING...</div>;

  const cost = selectedNFT.level * 500;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <SectionTitle title="LAB" subtitle="ONE VIAL. ONE UPGRADE." />

      <div className="mt-10 bg-deep/80 panel-border p-6 flex flex-col items-center gap-6">
        <div className="w-24 h-36 border-4 border-green/60 rounded-t-xl rounded-b-lg relative flex items-center justify-center shadow-[0_0_40px_rgba(0,200,5,0.3)] bg-darkGreen">
          <div className="absolute -top-3 w-10 h-3 bg-gray rounded-sm" />
          <span className="font-bangers text-xl text-green rotate-90 tracking-widest">PFP</span>
        </div>
        <div className="text-center">
          <p className="font-tech text-gray text-xs tracking-widest">#{selectedNFT.id}</p>
          <p className="font-bangers text-3xl text-white tracking-widest">LV {selectedNFT.level}</p>
          <p className="font-tech text-green text-xs mt-2 tracking-widest">
            {selectedNFT.purity.toFixed(0)} / {selectedNFT.stability.toFixed(0)} / {selectedNFT.potency.toFixed(0)}
          </p>
        </div>
        <p className="font-tech text-green tracking-widest">☣ {cost} $PLAGUES</p>
        <button
          onClick={handleUpgrade}
          disabled={status !== "idle"}
          className="w-full py-4 font-tech tracking-[0.2em] uppercase bg-green text-black hover:bg-green-bright disabled:opacity-60"
        >
          {status === "idle" && "UPGRADE"}
          {status === "upgrading" && "MUTATING..."}
          {status === "success" && "DONE"}
        </button>
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
