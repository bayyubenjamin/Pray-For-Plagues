"use client";

import { useEffect, useState } from "react";
import LabGateModal from "@/components/LabGateModal";
import { loadPlayer } from "@/lib/points";

export default function EnterLabButton({
  className,
  label = "ENTER LAB",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [xHandle, setXHandle] = useState("");

  const check = () => {
    const player = loadPlayer();
    setXHandle(player.xHandle || "");
    const local = player.completed.includes("waitlist");
    setJoined(local);
    if (player.xHandle) {
      fetch(`/api/waitlist?x=${encodeURIComponent(player.xHandle)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.entry) setJoined(true);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    check();
  }, []);

  return (
    <>
      <button type="button" onClick={() => { check(); setOpen(true); }} className={className}>
        {label}
      </button>
      <LabGateModal open={open} onClose={() => { setOpen(false); check(); }} joined={joined} xHandle={xHandle} />
    </>
  );
}
