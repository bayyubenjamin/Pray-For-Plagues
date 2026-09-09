"use client";

import { useEffect, useState } from "react";
import EnterLabButton from "@/components/EnterLabButton";
import LabGateModal from "@/components/LabGateModal";
import { loadPlayer } from "@/lib/points";

export default function UpgradePage() {
  const [open, setOpen] = useState(true);
  const [joined, setJoined] = useState(false);
  const [xHandle, setXHandle] = useState("");

  useEffect(() => {
    const player = loadPlayer();
    setXHandle(player.xHandle || "");
    setJoined(player.completed.includes("waitlist"));
    if (player.xHandle) {
      fetch(`/api/waitlist?x=${encodeURIComponent(player.xHandle)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.entry) setJoined(true);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="font-bangers text-4xl text-green text-aura tracking-widest">LAB</p>
      <p className="font-tech text-xs text-gray tracking-widest mt-3">WAITLIST REQUIRED BEFORE MINT.</p>
      <div className="mt-8">
        <EnterLabButton className="px-10 py-4 bg-green text-black font-tech font-bold tracking-[0.2em]" label="ENTER LAB" />
      </div>
      <LabGateModal open={open} onClose={() => setOpen(false)} joined={joined} xHandle={xHandle} />
    </div>
  );
}
