"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import SectionTitle from "@/components/SectionTitle";
import ConnectWallet from "@/components/ConnectWallet";
import { formatAddress } from "@/lib/utils";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      <SectionTitle title="PROFILE" subtitle="WALLET. IDENTITY. SURVIVAL LOG." />

      <div className="mt-12 border border-green/20 bg-black/50 p-6 sm:p-8 panel-border">
        {!isConnected || !address ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <p className="font-tech text-xs tracking-widest text-gray uppercase text-center">
              CONNECT WALLET TO OPEN YOUR PROFILE.
            </p>
            <ConnectWallet />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-tech text-[10px] tracking-widest text-gray uppercase mb-2">ADDRESS</p>
              <p className="font-tech text-green tracking-wider">{formatAddress(address)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-green/20 p-4">
                <p className="font-tech text-[10px] text-gray tracking-widest">STATUS</p>
                <p className="font-tech text-green mt-1">CONNECTED</p>
              </div>
              <div className="border border-green/20 p-4">
                <p className="font-tech text-[10px] text-gray tracking-widest">NETWORK</p>
                <p className="font-tech text-green mt-1">ROBINHOOD</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/inventory"
                className="px-6 py-3 border border-green text-green font-tech text-xs tracking-widest uppercase text-center hover:bg-darkGreen box-aura"
              >
                INVENTORY
              </Link>
              <Link
                href="/waitlist"
                className="px-6 py-3 bg-green text-black font-tech text-xs tracking-widest uppercase text-center hover:bg-green-bright box-aura"
              >
                JOIN WAITLIST
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
