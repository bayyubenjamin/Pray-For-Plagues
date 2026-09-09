"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { completeTask, loadPlayer } from "@/lib/points";
import { captureRefFromUrl } from "@/lib/referral";
import SocialTasks from "@/components/SocialTasks";
import { loadWaitlist, saveWaitlist } from "@/lib/waitlist-local";

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export default function WaitlistForm({ xHandle }: { xHandle?: string | null }) {
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [refLocked, setRefLocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [lockedWallet, setLockedWallet] = useState("");

  const handle = xHandle || loadPlayer().xHandle;

  useEffect(() => {
    const captured = captureRefFromUrl();
    if (captured) {
      setRefCode(captured);
      setRefLocked(true);
    }
    const local = loadWaitlist();
    if (local.joined) {
      setJoined(true);
      setLockedWallet(local.wallet || "");
      setStatus("ok");
    }
    const x = handle;
    if (x) {
      fetch(`/api/waitlist?x=${encodeURIComponent(x)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.entry) {
            saveWaitlist({
              joined: true,
              wallet: json.entry.wallet,
              xHandle: json.entry.x_handle,
              email: json.entry.email,
            });
            setJoined(true);
            setLockedWallet(json.entry.wallet || "");
            setStatus("ok");
          }
        })
        .catch(() => {});
    }
  }, [handle]);

  const ready = Boolean(handle);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!handle) {
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
          xHandle: handle,
          referredBy: (refCode || captureRefFromUrl()).replace(/^@/, "").trim().toLowerCase() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      completeTask("waitlist", { wallet: w, xHandle: handle });
      saveWaitlist({ joined: true, wallet: w, xHandle: handle, email: email.trim().toLowerCase() });
      setJoined(true);
      setLockedWallet(w);
      setStatus("ok");
      setMessage(
        json.referralAwarded
          ? "JOINED. REFERRAL COUNTED +200 TO INVITER."
          : "YOU ARE ON THE WAITLIST."
      );
      window.dispatchEvent(new Event("pfp-waitlist"));
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message.toUpperCase() : "FAILED.");
    }
  };

  if (joined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-bangers text-2xl text-green text-aura tracking-widest">YOU ARE ON THE WAITLIST</p>
        {lockedWallet && (
          <p className="font-tech text-[10px] text-green tracking-widest">
            LOCKED WALLET {lockedWallet.slice(0, 6)}...{lockedWallet.slice(-4)}
          </p>
        )}
        <p className="font-tech text-[10px] text-gray tracking-widest">
          CONNECT THAT WALLET ONLY. CLIMB RANK ON TASK.
        </p>
        <Link href="/task" className="px-6 py-3 bg-green text-black font-tech text-xs tracking-widest text-center">
          OPEN TASK
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <ol className="font-tech text-[10px] text-gray tracking-widest leading-relaxed space-y-1">
        <li>1. CONNECT X</li>
        <li>2. SOCIAL TASKS</li>
        <li>3. PASTE WALLET + EMAIL</li>
      </ol>

      {!ready && (
        <a
          href="/api/x/start"
          className="inline-block px-6 py-3 border border-green text-green font-tech text-xs tracking-widest text-center hover:bg-darkGreen box-aura"
        >
          CONNECT X
        </a>
      )}

      {ready && (
        <p className="font-tech text-[10px] text-green tracking-widest">X CONNECTED @{handle}</p>
      )}

      <SocialTasks enabled={ready} />

      <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
        <input
          value={wallet}
          disabled={!ready}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="WALLET 0x..."
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest outline-none focus:border-green box-aura disabled:opacity-40"
        />
        <input
          type="email"
          required
          disabled={!ready}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL"
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest uppercase outline-none focus:border-green box-aura disabled:opacity-40"
        />
        <input
          readOnly={refLocked}
          disabled={!ready && !refLocked}
          value={refCode}
          onChange={(e) => {
            if (!refLocked) setRefCode(e.target.value);
          }}
          placeholder="REF CODE (X HANDLE)"
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest outline-none focus:border-green box-aura disabled:opacity-40 read-only:opacity-70"
        />
        {refLocked && (
          <p className="font-tech text-[10px] text-green tracking-widest">REF LOCKED FROM INVITE LINK</p>
        )}
        <button
          type="submit"
          disabled={!ready || status === "loading"}
          className="px-8 py-3 bg-green text-black font-tech font-bold text-sm tracking-[0.2em] hover:bg-green-bright transition-colors uppercase box-aura disabled:opacity-50"
        >
          {status === "loading" ? "SAVING..." : "JOIN WAITLIST"}
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
