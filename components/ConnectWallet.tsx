"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { LogOut, Copy, Check, User } from "lucide-react";
import { formatAddress } from "@/lib/utils";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
    if (injected) connect({ connector: injected });
  };

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="px-4 py-2 bg-darkGreen border border-green text-green font-tech hover:bg-green/10 transition-colors uppercase text-sm tracking-wider"
        >
          {formatAddress(address)}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-deep border border-green/30 panel-border z-50">
            <div className="p-2 border-b border-green/20 text-xs text-gray uppercase tracking-widest">
              WALLET
            </div>
            <Link
              href="/profile"
              onClick={() => setShowDropdown(false)}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-darkGreen transition-colors flex items-center justify-between"
            >
              PROFILE
              <User size={14} />
            </Link>
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-darkGreen transition-colors flex items-center justify-between"
            >
              COPY ADDRESS
              {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-between"
            >
              DISCONNECT
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="px-6 py-2 border border-green text-green bg-black hover:bg-darkGreen font-tech uppercase text-sm tracking-wider box-aura"
    >
      {isPending ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
}
