"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { LogOut, Copy, Check, User } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { robinhoodChain } from "@/lib/config";
import { completeTask } from "@/lib/points";

export default function ConnectWallet({ compact }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const onRh = chainId === robinhoodChain.id;

  useEffect(() => {
    if (isConnected && address) {
      completeTask("connect_wallet", { wallet: address });
      if (onRh) completeTask("robinhood_chain", { wallet: address });
    }
  }, [isConnected, address, onRh]);

  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
    if (injected) connect({ connector: injected, chainId: robinhoodChain.id });
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
          className="px-3 py-2 bg-darkGreen border border-green text-green font-tech hover:bg-green/10 transition-colors uppercase text-xs sm:text-sm tracking-wider"
        >
          {onRh ? formatAddress(address) : compact ? "WRONG NET" : "SWITCH NETWORK"}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-52 bg-deep border border-green/30 panel-border z-50">
            <div className="p-2 border-b border-green/20 text-[10px] text-gray uppercase tracking-widest">
              {onRh ? "ROBINHOOD CHAIN" : "WRONG NETWORK"}
            </div>
            {!onRh && (
              <button
                onClick={() => switchChain({ chainId: robinhoodChain.id })}
                className="w-full text-left px-4 py-3 text-xs text-green hover:bg-darkGreen transition-colors"
              >
                {isSwitching ? "SWITCHING..." : "SWITCH TO ROBINHOOD"}
              </button>
            )}
            <Link
              href="/profile"
              onClick={() => setShowDropdown(false)}
              className="w-full text-left px-4 py-3 text-xs text-white hover:bg-darkGreen transition-colors flex items-center justify-between"
            >
              PROFILE
              <User size={14} />
            </Link>
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-3 text-xs text-white hover:bg-darkGreen transition-colors flex items-center justify-between"
            >
              COPY ADDRESS
              {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 text-xs text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-between"
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
      className="px-4 py-2 border border-green text-green bg-black hover:bg-darkGreen font-tech uppercase text-xs sm:text-sm tracking-wider box-aura"
    >
      {isPending ? "CONNECTING..." : compact ? "CONNECT" : "CONNECT WALLET"}
    </button>
  );
}
