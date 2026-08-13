import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import ScrollReveal from "@/components/ScrollReveal";
import { MOCK_NFTS, MOCK_STATS } from "@/lib/mockData";
import Link from "next/link";

export default function Home() {
  const previewNFTs = MOCK_NFTS.slice(0, 5);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* HANYA GRADASI GELAP (Video background sudah di-handle global oleh BackgroundEffects di layout.tsx) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-deep/80 to-deep"></div>
        </div>

        {/* Konten Teks Hero */}
        <ScrollReveal className="text-center max-w-4xl mx-auto z-20 flex flex-col items-center gap-6">
          <h1 className="font-bangers text-6xl sm:text-7xl md:text-[5rem] text-green tracking-wider text-aura leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            PRAY FOR PLAGUES
          </h1>
          
          <p className="font-tech text-gray text-xs md:text-sm tracking-[0.3em] uppercase max-w-2xl px-6 py-2 bg-black/50 border border-green/20 backdrop-blur-sm box-aura">
            THE PLAGUE HAS ARRIVED ON <span className="text-green font-bold">ROBINHOOD</span> CHAIN.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-6 w-full sm:w-auto">
            <Link 
              href="/upgrade"
              className="px-10 py-4 bg-green text-black font-tech font-bold text-lg tracking-[0.2em] hover:bg-green-bright transition-colors uppercase text-center box-aura"
            >
              ENTER LAB
            </Link>
            <Link 
              href="/inventory"
              className="px-10 py-4 bg-black/80 backdrop-blur-sm border border-green text-green font-tech font-bold text-lg tracking-[0.2em] hover:bg-darkGreen transition-colors uppercase text-center box-aura"
            >
              VIEW COLLECTION
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Stats Section dengan Efek Scroll */}
      <ScrollReveal className="w-full max-w-6xl mx-auto px-4 py-16 border-t border-b border-green/10 bg-black/40 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {MOCK_STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <span className="font-tech text-3xl md:text-5xl text-white">{stat.value}</span>
              <span className="font-tech text-xs md:text-sm text-gray tracking-[0.2em] uppercase">{stat.label}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Lab Preview Section dengan Efek Scroll & Kartu Berurutan */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24">
        <ScrollReveal>
          <SectionTitle title="ANTIDOTE LAB" subtitle="UPGRADE. MUTATE. SURVIVE." />
        </ScrollReveal>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          {previewNFTs.map((nft, index) => (
            <ScrollReveal key={nft.id} delay={index * 150}>
              <AntidoteCard nft={nft} actionLabel="VIEW DETAILS" />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="flex justify-center mt-12" delay={300}>
          <Link href="/inventory" className="text-green font-tech tracking-widest border-b border-green pb-1 hover:text-green-bright transition-colors">
            VIEW ALL ANTIDOTES
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
