"use client";
import { useState } from "react";
import { formatAddress } from "@/lib/utils";
import { LogOut, Copy, Check } from "lucide-react";

export default function ConnectWallet() {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [address, setAddress] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock connection
  const handleConnect = () => {
    setStatus("connecting");
    setTimeout(() => {
      setStatus("connected");
      setAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // Mock address
    }, 1500);
  };

  const handleDisconnect = () => {
    setStatus("disconnected");
    setAddress("");
    setShowDropdown(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "connected") {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 bg-darkGreen border border-green text-green font-tech hover:bg-green/10 transition-colors uppercase text-sm tracking-wider"
        >
          {formatAddress(address)}
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-deep border border-green/30 panel-border z-50">
            <div className="p-2 border-b border-green/20 text-xs text-gray uppercase tracking-widest">
              DEMO MODE
            </div>
            <button 
              onClick={handleCopy}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-darkGreen transition-colors flex items-center justify-between"
            >
              COPY ADDRESS
              {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            </button>
            <button 
              onClick={handleDisconnect}
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
      disabled={status === "connecting"}
      className="px-6 py-2 border border-green text-green bg-black hover:bg-darkGreen font-tech uppercase text-sm tracking-wider box-aura"
    >
      {status === "connecting" ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
}
