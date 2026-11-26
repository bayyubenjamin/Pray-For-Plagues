"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { robinhoodChain, walletConnectEnabled } from "@/lib/config";
import { completeTask, loadPlayer } from "@/lib/points";
import { loadWaitlist } from "@/lib/waitlist-local";

function hasInjectedProvider() {
  if (typeof window === "undefined") return false;
  return Boolean((window as unknown as { ethereum?: unknown }).ethereum);
}

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/rejected|denied|user rejected/i.test(msg)) return "CONNECTION REJECTED IN WALLET.";
  if (/already|pending/i.test(msg)) return "A WALLET REQUEST IS ALREADY OPEN.";
  return "CONNECTION FAILED. TRY AGAIN.";
}

export default function ConnectWallet({ compact }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [locked, setLocked] = useState("");
  const [mismatch, setMismatch] = useState("");
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rejecting = useRef(false);
  const saved = useRef("");

  const refreshGate = () => {
    const w = loadWaitlist();
    setJoined(Boolean(w.joined && w.wallet));
    setLocked((w.wallet || "").toLowerCase());
  };

  useEffect(() => {
    refreshGate();
    setIsMobile(isCoarsePointer());
    const onJoin = () => refreshGate();
    window.addEventListener("pfp-waitlist", onJoin);
    return () => window.removeEventListener("pfp-waitlist", onJoin);
  }, []);

  // Wagmi surfaces connect/switch failures as error objects — derive the
  // message during render instead of syncing it into state in an effect.
  const errorNotice = connectError
    ? friendlyError(connectError)
    : switchError
      ? friendlyError(switchError)
      : "";

  const onRh = chainId === robinhoodChain.id;

  useEffect(() => {
    if (!joined || !locked) return;
    if (!isConnected || !address) return;
    if (address.toLowerCase() === locked) {
      rejecting.current = false;
      setMismatch("");
      completeTask("connect_wallet", { wallet: address });
      if (onRh) completeTask("robinhood_chain", { wallet: address });
      const x = loadPlayer().xHandle || loadWaitlist().xHandle;
      if (x && saved.current !== address.toLowerCase()) {
        saved.current = address.toLowerCase();
        fetch("/api/profile", {
          method: "POST",
          headers: { "content-type": "application/json" },
          // No points here: the server owns points; this only links the
          // connected wallet to the X identity.
          body: JSON.stringify({
            xHandle: x,
            wallet: locked,
            connectedWallet: address.toLowerCase(),
          }),
        }).catch(() => {});
      }
      return;
    }
    rejecting.current = true;
    setMismatch(`WRONG WALLET. SWITCH TO ${locked.slice(0, 6)}...${locked.slice(-4)}`);
    disconnect();
  }, [isConnected, address, joined, locked, onRh, disconnect]);

  const handleConnect = () => {
    setNotice("");
    if (!hasInjectedProvider()) {
      setShowHelp(true);
      return;
    }
    setShowHelp(false);
    if (rejecting.current && address && locked && address.toLowerCase() !== locked) {
      disconnect();
      setMismatch(`WRONG WALLET. SWITCH ACCOUNT IN EXTENSION TO ${locked.slice(0, 6)}...${locked.slice(-4)} THEN CONNECT.`);
      return;
    }
    const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
    if (!injected) {
      setNotice("NO WALLET CONNECTOR AVAILABLE.");
      return;
    }
    connect({ connector: injected, chainId: robinhoodChain.id });
  };

  const handleWalletConnect = () => {
    setNotice("");
    setShowHelp(false);
    if (rejecting.current && address && locked && address.toLowerCase() !== locked) {
      disconnect();
      setMismatch(`WRONG WALLET. SWITCH ACCOUNT IN YOUR WALLET APP TO ${locked.slice(0, 6)}...${locked.slice(-4)} THEN CONNECT.`);
      return;
    }
    const wc = connectors.find((c) => c.id === "walletConnect");
    if (!wc) {
      setNotice("WALLETCONNECT IS NOT AVAILABLE.");
      return;
    }
    connect({ connector: wc, chainId: robinhoodChain.id });
  };

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const help = (
    <div className="mt-2 w-72 max-w-[80vw] border border-green/30 bg-black p-4 text-left">
      <p className="font-tech text-[10px] tracking-widest text-green">NO WALLET DETECTED</p>
      {isMobile ? (
        <p className="mt-2 font-tech text-[11px] leading-relaxed text-zinc-300">
          OPEN THIS SITE FROM YOUR WALLET APP BROWSER — METAMASK, OKX, OR RAINBOW — THEN TAP CONNECT AGAIN.
        </p>
      ) : (
        <p className="mt-2 font-tech text-[11px] leading-relaxed text-zinc-300">
          INSTALL THE METAMASK EXTENSION, REFRESH THE PAGE, THEN TAP CONNECT AGAIN.
        </p>
      )}
      {walletConnectEnabled ? (
        <button
          type="button"
          onClick={() => {
            setShowHelp(false);
            handleWalletConnect();
          }}
          className="mt-3 w-full px-4 py-2 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen"
        >
          SCAN QR — WALLETCONNECT
        </button>
      ) : (
        <p className="mt-2 font-tech text-[10px] leading-relaxed tracking-widest text-zinc-400">
          WALLETCONNECT (QR) IS NOT SET UP YET — IT NEEDS A PROJECT ID.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setShowHelp(false);
          handleConnect();
        }}
        className="mt-3 w-full px-4 py-2 border border-green text-green font-tech text-xs tracking-widest hover:bg-darkGreen"
      >
        TRY AGAIN
      </button>
    </div>
  );

  if (isConnected && address && (!locked || address.toLowerCase() === locked)) {
    if (!onRh) {
      return (
        <div className="flex flex-col items-end gap-1 max-w-[240px]">
          <button
            onClick={() => switchChain({ chainId: robinhoodChain.id })}
            disabled={isSwitching}
            className="px-4 py-2 bg-green text-black font-tech font-bold uppercase text-xs sm:text-sm tracking-wider hover:bg-green-bright disabled:opacity-50"
          >
            {isSwitching ? "SWITCHING..." : compact ? "SWITCH NETWORK" : "SWITCH TO ROBINHOOD"}
          </button>
          <button
            type="button"
            onClick={() => disconnect()}
            className="font-tech text-[10px] tracking-widest text-zinc-400 hover:text-green"
          >
            DISCONNECT {formatAddress(address)}
          </button>
          {(notice || errorNotice) && <p className="font-tech text-[10px] text-red-500 tracking-widest text-right">{notice || errorNotice}</p>}
        </div>
      );
    }
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="px-3 py-2 bg-darkGreen border border-green text-green font-tech hover:bg-green/10 uppercase text-xs sm:text-sm tracking-wider"
        >
          {formatAddress(address)}
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-52 bg-deep border border-green/30 panel-border z-50">
            <div className="p-2 border-b border-green/20 text-[10px] text-zinc-400 uppercase tracking-widest">
              ROBINHOOD CHAIN
            </div>
            <Link href="/profile" onClick={() => setShowDropdown(false)} className="block w-full text-left px-4 py-3 text-xs text-white hover:bg-darkGreen">
              PROFILE
            </Link>
            <button onClick={handleCopy} className="w-full text-left px-4 py-3 text-xs text-white hover:bg-darkGreen">
              {copied ? "COPIED" : "COPY ADDRESS"}
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 text-xs text-red-500 hover:bg-red-500/10"
            >
              DISCONNECT
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-end gap-1 max-w-[240px]">
      <button onClick={handleConnect} disabled={isPending} className="px-4 py-2 border border-green text-green bg-black hover:bg-darkGreen font-tech uppercase text-xs sm:text-sm tracking-wider box-aura disabled:opacity-50">
        {isPending ? "CONNECTING..." : "CONNECT WALLET"}
      </button>
      {walletConnectEnabled && (
        <button
          type="button"
          onClick={handleWalletConnect}
          disabled={isPending}
          className="font-tech text-[10px] tracking-widest text-zinc-400 hover:text-green disabled:opacity-50"
        >
          OR SCAN QR — WALLETCONNECT
        </button>
      )}
      {mismatch && <p className="font-tech text-[10px] text-red-500 tracking-widest text-right">{mismatch}</p>}
      {(notice || errorNotice) && <p className="font-tech text-[10px] text-red-500 tracking-widest text-right">{notice || errorNotice}</p>}
      {showHelp && help}
    </div>
  );
}
