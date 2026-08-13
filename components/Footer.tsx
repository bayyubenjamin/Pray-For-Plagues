export default function Footer() {
  return (
    <footer className="w-full border-t border-green/10 bg-deep/80 py-8 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-6">
        <div className="text-center font-bangers text-2xl text-gray tracking-wider">
          <p>THE PLAGUE IS REAL.</p>
          <p>THE CURE IS RARE.</p>
        </div>
        <div className="flex gap-6 text-xs text-gray font-tech tracking-widest">
          <a href="#" className="hover:text-green transition-colors">X</a>
          <a href="#" className="hover:text-green transition-colors">OPENSEA</a>
          <a href="#" className="hover:text-green transition-colors">ROBINHOOD CHAIN</a>
          <a href="#" className="hover:text-green transition-colors">DISCORD</a>
        </div>
        <div className="text-[10px] text-gray/50 uppercase">
          DEMO ENVIRONMENT. NO REAL CONTRACTS CONNECTED.
        </div>
      </div>
    </footer>
  );
}
