import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-green/10 bg-deep/80 py-8 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-6">
        <div className="text-center font-bangers text-2xl text-gray tracking-wider">
          <p>THE PLAGUE IS REAL.</p>
          <p>THE CURE IS RARE.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-gray font-tech tracking-widest">
          <a href="https://x.com/pfphood" target="_blank" rel="noreferrer" className="hover:text-green transition-colors">X</a>
          <Link href="/vault" className="hover:text-green transition-colors">VAULT</Link>
          <Link href="/task" className="hover:text-green transition-colors">WAITLIST</Link>
          <a href="https://docs.robinhood.com/chain" target="_blank" rel="noreferrer" className="hover:text-green transition-colors">ROBINHOOD CHAIN</a>
        </div>
        <div className="text-[10px] text-gray/50 uppercase">
          ROBINHOOD CHAIN · 2,000 VIALS
        </div>
      </div>
    </footer>
  );
}
