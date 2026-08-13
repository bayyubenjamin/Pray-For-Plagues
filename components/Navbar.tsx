'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-green/20">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="font-bangers text-3xl text-green tracking-wider hover:opacity-80 transition">
          PRAY FOR PLAGUES
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 font-tech text-sm tracking-widest text-white">
          <Link href="/" className="hover:text-green transition-colors">HOME</Link>
          <Link href="/inventory" className="hover:text-green transition-colors">INVENTORY</Link>
          <Link href="/upgrade" className="hover:text-green transition-colors">UPGRADE</Link>
          <Link href="/leaderboard" className="hover:text-green transition-colors">LEADERBOARD</Link>
        </nav>

        {/* Connect Wallet Button (Desktop) */}
        <div className="hidden md:block">
          <Link 
            href="/upgrade" 
            className="px-6 py-2.5 bg-black/80 border border-green text-green font-tech text-sm tracking-wider hover:bg-green hover:text-black transition-all box-aura uppercase"
          >
            CONNECT WALLET
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-green focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 border-b border-green/20 px-4 pt-4 pb-6 flex flex-col gap-4 font-tech tracking-widest">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-green transition-colors py-2"
          >
            HOME
          </Link>
          <Link 
            href="/inventory" 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-green transition-colors py-2"
          >
            INVENTORY
          </Link>
          <Link 
            href="/upgrade" 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-green transition-colors py-2"
          >
            UPGRADE
          </Link>
          <Link 
            href="/leaderboard" 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-green transition-colors py-2"
          >
            LEADERBOARD
          </Link>
          <div className="pt-2">
            <Link 
              href="/upgrade" 
              onClick={() => setIsOpen(false)}
              className="w-full block text-center px-6 py-3 bg-green text-black font-tech text-sm tracking-wider uppercase font-bold"
            >
              CONNECT WALLET
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
