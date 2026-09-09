'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ConnectWallet from '@/components/ConnectWallet';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-green/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full border-2 border-green shadow-[0_0_15px_rgba(74,222,128,0.6)]"
            />
          </Link>

          <nav className="flex items-center gap-8 font-tech text-sm tracking-widest">
            <Link href="/" className={`transition-colors ${isActive('/') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>HOME</Link>
            <Link href="/inventory" className={`transition-colors ${isActive('/inventory') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>INVENTORY</Link>
            <Link href="/upgrade" className={`transition-colors ${isActive('/upgrade') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>LAB</Link>
            <Link href="/leaderboard" className={`transition-colors ${isActive('/leaderboard') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>RANK</Link>
            <Link href="/profile" className={`transition-colors ${isActive('/profile') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>PROFILE</Link>
          </nav>

          <ConnectWallet />
        </div>
      </header>

      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-green/20 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={34}
            height={34}
            className="rounded-full border border-green shadow-[0_0_10px_rgba(74,222,128,0.5)]"
          />
        </Link>
        <ConnectWallet compact />
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/95 backdrop-blur-lg border-t border-green/30 px-4 py-2 flex items-center justify-around font-tech text-[10px] tracking-wider shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        <Link href="/" className={`flex flex-col items-center py-1 ${isActive('/') ? 'text-green font-bold' : 'text-gray-400'}`}>
          <span>HOME</span>
        </Link>
        <Link href="/inventory" className={`flex flex-col items-center py-1 ${isActive('/inventory') ? 'text-green font-bold' : 'text-gray-400'}`}>
          <span>INV</span>
        </Link>
        <Link href="/upgrade" className={`flex flex-col items-center py-1 ${isActive('/upgrade') ? 'text-green font-bold' : 'text-gray-400'}`}>
          <span>LAB</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center py-1 ${isActive('/profile') ? 'text-green font-bold' : 'text-gray-400'}`}>
          <span>PROFILE</span>
        </Link>
      </nav>
    </>
  );
}
