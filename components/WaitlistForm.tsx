"use client";

import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import ConnectWallet from "@/components/ConnectWallet";
import { completeTask, loadPlayer } from "@/lib/points";
import { OPENSEA_COLLECTION_URL } from "@/lib/nhost";

export default function WaitlistForm() {
  const { address, isConnected } = useAccount();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address) {
      setStatus("error");
      setMessage("CONNECT WALLET FIRST.");
      return;
    }
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("ENTER A VALID EMAIL.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const player = loadPlayer();
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          wallet: address,
          xHandle: player.xHandle ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      completeTask("waitlist", { wallet: address });
      setStatus("ok");
      setMessage("ALLOWLISTED. WALLET LOCKED FOR MINT.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message.toUpperCase() : "FAILED TO JOIN.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <p className="font-tech text-[10px] text-gray tracking-widest leading-relaxed">
        NFT ALLOWLIST — WALLET ON ROBINHOOD CHAIN GETS MINT ACCESS.
        SAME WALLET SHOULD MATCH YOUR OPENSEA ACCOUNT.
      </p>
      <a
        href={OPENSEA_COLLECTION_URL}
        target="_blank"
        rel="noreferrer"
        className="font-tech text-[10px] text-green tracking-widest border-b border-green w-fit"
      >
        VIEW COLLECTION ON OPENSEA
      </a>

      {!isConnected && (
        <div className="flex flex-col gap-3">
          <p className="font-tech text-xs text-green tracking-widest">WALLET REQUIRED</p>
          <ConnectWallet />
        </div>
      )}

      <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
        {address && (
          <p className="font-tech text-[10px] text-green tracking-widest">
            MINT WALLET: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL"
          className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest uppercase outline-none focus:border-green box-aura"
        />
        <button
          type="submit"
          disabled={status === "loading" || !isConnected}
          className="px-8 py-3 bg-green text-black font-tech font-bold text-sm tracking-[0.2em] hover:bg-green-bright transition-colors uppercase box-aura disabled:opacity-50"
        >
          {status === "loading" ? "LOCKING SLOT..." : "JOIN NFT WAITLIST"}
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
