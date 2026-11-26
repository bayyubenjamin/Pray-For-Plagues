'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ConnectWallet from '@/components/ConnectWallet';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === '/task') return pathname === '/task' || pathname === '/leaderboard' || pathname === '/waitlist';
    if (path === '/inventory') return pathname === '/inventory' || pathname === '/vault';
    if (path === '/upgrade') return pathname === '/upgrade';
    return pathname === path;
  };

  return (
    <>
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-[#050705]/90 backdrop-blur-md border-b border-green/30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition">
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={40}
              height={40}
              priority
              className="rounded-full border-2 border-green shadow-[0_0_15px_rgba(74,222,128,0.6)]"
            />
          </Link>

          <nav className="flex items-center gap-8 font-tech text-sm tracking-widest">
            <Link href="/" className={`transition-colors ${isActive('/') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>HOME</Link>
            <Link href="/inventory" className={`transition-colors ${isActive('/inventory') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>INVENTORY</Link>
            <Link href="/upgrade" className={`transition-colors ${isActive('/upgrade') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>LAB</Link>
            <Link href="/task" className={`transition-colors ${isActive('/task') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>TASK</Link>
            <Link href="/profile" className={`transition-colors ${isActive('/profile') ? 'text-green font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white hover:text-green'}`}>PROFILE</Link>
          </nav>

          <div>
            <ConnectWallet />
          </div>
        </div>
      </header>

      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-[#050705]/90 backdrop-blur-md border-b border-green/20 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition">
          <Image
            src="/images/logo.webp"
            alt="Logo"
            width={34}
            height={34}
            priority
            className="rounded-full border border-green shadow-[0_0_10px_rgba(74,222,128,0.5)]"
          />
        </Link>
        <ConnectWallet compact />
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#050705]/90 backdrop-blur-md border-t border-green/30 px-2 py-2 flex items-stretch justify-around font-tech text-[11px] tracking-wider">
        {([
          { href: "/", label: "HOME", active: isActive("/") },
          { href: "/inventory", label: "INVENTORY", active: isActive("/inventory") },
          { href: "/upgrade", label: "LAB", active: isActive("/upgrade") },
          { href: "/task", label: "TASK", active: isActive("/task") },
          { href: "/profile", label: "PROFILE", active: isActive("/profile") },
        ] as const).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-1 border-t-2 transition-colors ${
              item.active ? "text-green font-bold border-green" : "text-gray-400 hover:text-green border-transparent"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
