'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Helper untuk mengecek apakah link aktif
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 1. HEADER DESKTOP */}
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-green/20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-bangers text-3xl text-green tracking-wider hover:opacity-80 transition drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
            PRAY FOR PLAGUES
          </Link>

          <nav className="flex items-center gap-8 font-tech text-sm tracking-widest">
            <Link href="/" className={`transition-colors ${isActive('/') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>HOME</Link>
            <Link href="/inventory" className={`transition-colors ${isActive('/inventory') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>INVENTORY</Link>
            <Link href="/upgrade" className={`transition-colors ${isActive('/upgrade') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>UPGRADE</Link>
            <Link href="/leaderboard" className={`transition-colors ${isActive('/leaderboard') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>LEADERBOARD</Link>
          </nav>

          <div>
            <Link 
              href="/upgrade" 
              className="px-6 py-2.5 bg-black/80 border border-green text-green font-tech text-sm tracking-wider hover:bg-green hover:text-black transition-all box-aura uppercase shadow-[0_0_15px_rgba(74,222,128,0.3)]"
            >
              CONNECT WALLET
            </Link>
          </div>
        </div>
      </header>


      {/* 2. HEADER MOBILE (Atas) */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-green/20 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bangers text-2xl text-green tracking-wider drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
          PRAY FOR PLAGUES
        </Link>
        <Link 
          href="/upgrade" 
          className="px-3 py-1.5 bg-black/80 border border-green text-green font-tech text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(74,222,128,0.2)]"
        >
          CONNECT
        </Link>
      </header>


      {/* 3. BOTTOM NAVIGATION BAR MOBILE (Dinamis Berdasarkan Halaman Aktif) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/95 backdrop-blur-lg border-t border-green/30 px-4 py-2.5 flex items-center justify-around font-tech text-[10px] tracking-wider shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center transition group py-1 ${isActive('/') ? 'text-green font-bold' : 'text-gray-400 hover:text-green'}`}>
          <svg className={`w-5 h-5 transition ${isActive('/') ? 'text-green drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span className="mt-1">HOME</span>
        </Link>

        {/* Inventory */}
        <Link href="/inventory" className={`flex flex-col items-center transition group py-1 ${isActive('/inventory') ? 'text-green font-bold' : 'text-gray-400 hover:text-green'}`}>
          <svg className={`w-5 h-5 transition ${isActive('/inventory') ? 'text-green drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span className="mt-1">INVENTORY</span>
        </Link>

        {/* Upgrade / Lab */}
        <Link href="/upgrade" className={`flex flex-col items-center transition group py-1 ${isActive('/upgrade') ? 'text-green font-bold' : 'text-gray-400 hover:text-green'}`}>
          <svg className={`w-5 h-5 transition ${isActive('/upgrade') ? 'text-green drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
          </svg>
          <span className="mt-1">UPGRADE</span>
        </Link>

        {/* Leaderboard */}
        <Link href="/leaderboard" className={`flex flex-col items-center transition group py-1 ${isActive('/leaderboard') ? 'text-green font-bold' : 'text-gray-400 hover:text-green'}`}>
          <svg className={`w-5 h-5 transition ${isActive('/leaderboard') ? 'text-green drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span className="mt-1">RANK</span>
        </Link>

      </nav>
    </>
  );
}
