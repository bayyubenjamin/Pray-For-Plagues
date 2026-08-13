"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "./ConnectWallet";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/inventory", label: "INVENTORY" },
  { href: "/upgrade", label: "UPGRADE" },
  { href: "/leaderboard", label: "LEADERBOARD" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-green/20 bg-deep/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <span className="font-bangers text-3xl text-green group-hover:text-green-bright transition-colors text-glow tracking-wide">
              PRAY FOR PLAGUES
            </span>
          </Link>

{/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm tracking-widest transition-all duration-300",
                  pathname === link.href 
                    ? "text-green text-aura font-bold" // Active state dengan aura
                    : "text-gray hover:text-green text-aura" // Hover state dengan aura
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            <ConnectWallet />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-green hover:text-green-bright p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-deep border-b border-green/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 text-base font-medium tracking-wider",
                  pathname === link.href ? "text-green bg-darkGreen" : "text-gray hover:text-green hover:bg-darkGreen/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-4">
              <ConnectWallet />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
