"use client";

import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { nhost, isNhostConfigured } from "@/lib/nhost";
import { completeTask } from "@/lib/points";

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
        await nhost.graphql.request({
          query: INSERT_WAITLIST,
          variables: {
            email: email.trim().toLowerCase(),
            wallet: address ?? null,
          },
        });
      }
      completeTask("waitlist", { wallet: address });
      setStatus("ok");
      setMessage("YOU ARE ON THE LIST. +150 PTS");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("FAILED TO JOIN. TRY AGAIN.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
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
        disabled={status === "loading"}
        className="px-8 py-3 bg-green text-black font-tech font-bold text-sm tracking-[0.2em] hover:bg-green-bright transition-colors uppercase box-aura"
      >
        {status === "loading" ? "SUBMITTING..." : "JOIN WAITLIST"}
      </button>
      {message && (
        <p className={`font-tech text-xs tracking-widest ${status === "ok" ? "text-green" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
