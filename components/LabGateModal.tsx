"use client";

import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";
import { loadPlayer } from "@/lib/points";

export default function LabGateModal({
  open,
  onClose,
  joined,
  xHandle,
}: {
  open: boolean;
  onClose: () => void;
  joined: boolean;
  xHandle?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button type="button" className="absolute inset-0 bg-black/80" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-lg border border-green/40 bg-black panel-border p-6 sm:p-8 box-aura max-h-[85vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-3 right-4 text-gray font-tech text-xs tracking-widest hover:text-green">
          CLOSE
        </button>

        {joined ? (
          <div className="flex flex-col gap-5 pt-4">
            <p className="font-bangers text-3xl text-green text-aura tracking-widest">YOU ARE ON THE WAITLIST</p>
            <p className="font-tech text-xs text-gray tracking-widest leading-relaxed">
              LAB ACCESS IS LOCKED FOR MINT. KEEP CLIMBING RANK — COMPLETE TASKS AND REFERRALS TO STACK POINTS ON THE LEADERBOARD.
            </p>
            <Link
              href="/task"
              className="px-6 py-3 bg-green text-black font-tech font-bold text-sm tracking-[0.2em] text-center hover:bg-green-bright"
            >
              OPEN TASK
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pt-4">
            <p className="font-bangers text-3xl text-green text-aura tracking-widest">ENTER LAB</p>
            <p className="font-tech text-[10px] text-gray tracking-widest">JOIN WAITLIST FIRST.</p>
            <WaitlistForm xHandle={xHandle || loadPlayer().xHandle} />
          </div>
        )}
      </div>
    </div>
  );
}
