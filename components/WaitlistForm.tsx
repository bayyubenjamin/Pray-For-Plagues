"use client";

import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { nhost, isNhostConfigured } from "@/lib/nhost";

const INSERT_WAITLIST = `
  mutation InsertWaitlist($email: String!, $wallet: String) {
    insert_waitlist_one(object: { email: $email, wallet: $wallet }) {
      id
    }
  }
`;

export default function WaitlistForm() {
  const { address } = useAccount();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("ENTER A VALID EMAIL.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      if (isNhostConfigured) {
        const { error } = await nhost.graphql.request(INSERT_WAITLIST, {
          email: email.trim().toLowerCase(),
          wallet: address ?? null,
        });
        if (error) throw error;
      }
      setStatus("ok");
      setMessage("YOU ARE ON THE LIST.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("FAILED TO JOIN. TRY AGAIN.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="EMAIL"
        className="w-full px-4 py-3 bg-black/80 border border-green/30 text-green font-tech text-sm tracking-widest uppercase outline-none focus:border-green box-aura"
      />
      {address && (
        <p className="text-[10px] font-tech text-gray tracking-widest uppercase">
          WALLET LINKED: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-8 py-3.5 bg-green text-black font-tech font-bold text-sm tracking-[0.2em] hover:bg-green-bright transition-colors uppercase box-aura"
      >
        {status === "loading" ? "SUBMITTING..." : "JOIN WAITLIST"}
      </button>
      {message && (
        <p
          className={`text-center font-tech text-xs tracking-widest ${
            status === "ok" ? "text-green" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
