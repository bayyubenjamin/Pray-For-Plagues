import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import ScrollReveal from "@/components/ScrollReveal";
import { MOCK_NFTS } from "@/lib/mockData";
import Link from "next/link";

export default function Home() {
  const previewNFTs = MOCK_NFTS.slice(0, 5);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        
        {/* Konten Teks Hero */}
        <ScrollReveal className="text-center max-w-4xl mx-auto z-20 flex flex-col items-center gap-4 sm:gap-6 mt-16 sm:mt-0">
          <h1 className="font-bangers text-4xl sm:text-7xl md:text-[5rem] text-green tracking-wider text-aura leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            PRAY FOR PLAGUES
          </h1>
          
          <p className="font-tech text-[8px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase max-w-2xl px-4 sm:px-6 py-2 bg-black/50 border border-green/20 backdrop-blur-sm box-aura">
            THE PLAGUE HAS ARRIVED ON <span className="text-green font-bold">ROBINHOOD</span> CHAIN.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 w-full sm:w-auto px-6 sm:px-0">
            <Link 
              href="/upgrade"
              className="px-8 sm:px-10 py-3.5 sm:py-4 bg-green text-black font-tech font-bold text-sm sm:text-lg tracking-[0.2em] hover:bg-green-bright transition-colors uppercase text-center box-aura"
            >
              ENTER LAB
            </Link>
            <Link 
              href="/inventory"
              className="px-8 sm:px-10 py-3.5 sm:py-4 bg-black/80 backdrop-blur-sm border border-green text-green font-tech font-bold text-sm sm:text-lg tracking-[0.2em] hover:bg-darkGreen transition-colors uppercase text-center box-aura"
            >
              VIEW COLLECTION
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Lab Preview Section */}
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
