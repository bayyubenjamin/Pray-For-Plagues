"use client";

import { FormEvent, useEffect, useState } from "react";
import { completeTask } from "@/lib/points";
import { captureRefFromUrl } from "@/lib/referral";

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export default function WaitlistForm({ xHandle }: { xHandle?: string | null }) {
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRefCode(captureRefFromUrl());
  }, []);

  const ready = Boolean(xHandle);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!xHandle) {
      setStatus("error");
      setMessage("CONNECT X FIRST.");
      return;
    }
    const w = wallet.trim().toLowerCase();
    if (!WALLET_RE.test(w)) {
      setStatus("error");
      setMessage("PASTE A VALID WALLET 0X.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          wallet: w,
          xHandle,
          referredBy: (refCode || captureRefFromUrl()).replace(/^@/, "").trim().toLowerCase() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      completeTask("waitlist", { wallet: w, xHandle });
      setStatus("ok");
      setMessage(
        json.referralAwarded
          ? "JOINED. REFERRAL COUNTED +200 TO INVITER."
          : "LOCKED. 1 X / 1 WALLET / 1 EMAIL."
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message.toUpperCase() : "FAILED.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <ol className="font-tech text-[10px] text-gray tracking-widest leading-relaxed space-y-1">
        <li>1. CONNECT X</li>
        <li>2. PASTE WALLET 0x</li>
        <li>3. PASTE EMAIL — JOIN</li>
        <li>REF OPTIONAL. +200 IF INVITEE COMPLETES WAITLIST.</li>
      </ol>

      {!ready && <p className="font-tech text-xs text-green tracking-widest">CONNECT X FIRST TO UNLOCK FORM.</p>}

      <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
        <input
          value={wallet}
          disabled={!ready || status === "ok"}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="WALLET 0x..."
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest outline-none focus:border-green box-aura disabled:opacity-40"
        />
        <input
          type="email"
          required
          disabled={!ready || status === "ok"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL"
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest uppercase outline-none focus:border-green box-aura disabled:opacity-40"
        />
        <input
          disabled={!ready || status === "ok"}
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          placeholder="REF CODE (X HANDLE)"
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest outline-none focus:border-green box-aura disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!ready || status === "loading" || status === "ok"}
          className="px-8 py-3 bg-green text-black font-tech font-bold text-sm tracking-[0.2em] hover:bg-green-bright transition-colors uppercase box-aura disabled:opacity-50"
        >
          {status === "loading" ? "SAVING..." : status === "ok" ? "JOINED" : "JOIN WAITLIST"}
        </button>
        {message && (
          <p className={`font-tech text-xs tracking-widest ${status === "ok" ? "text-green" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
