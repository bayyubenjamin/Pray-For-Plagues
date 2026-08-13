import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import { MOCK_NFTS, MOCK_STATS } from "@/lib/mockData";
import Link from "next/link";
import Image from "next/image"; // IMPORT INI

export default function Home() {
  const previewNFTs = MOCK_NFTS.slice(0, 5);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        
        {/* --- GAMBAR HERO --- */}
        <div className="absolute inset-0 z-0 flex justify-center">
          <div className="relative w-full max-w-5xl h-full opacity-60 mix-blend-screen">
            {/* Pastikan file public/images/hero-hooded.png tersedia */}
            <Image 
              src="/images/hero-hooded.png" 
              alt="Plague Hero"
              fill
              className="object-contain object-top"
              priority
            />
          </div>
          {/* Efek gradien agar bawah gambar menyatu dengan background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep/50 to-deep z-10"></div>
        </div>

        {/* --- KONTEN TEKS HERO --- */}
        <div className="text-center max-w-4xl mx-auto z-20 flex flex-col items-center gap-6 mt-32 relative">
          
          <h1 className="font-bangers text-7xl md:text-[9rem] text-green tracking-wider text-aura leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            PRAY FOR PLAGUES
          </h1>
          
          <p className="font-tech text-gray text-sm md:text-xl tracking-[0.3em] uppercase max-w-2xl mt-4 bg-black/50 px-6 py-2 border border-green/20 backdrop-blur-sm box-aura">
            THE PLAGUE HAS ARRIVED ON <span className="text-green font-bold">ROBINHOOD</span> CHAIN.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-10 w-full sm:w-auto">
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16 border-t border-b border-green/10 bg-black/40 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {MOCK_STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <span className="font-tech text-3xl md:text-5xl text-white">{stat.value}</span>
              <span className="font-tech text-xs md:text-sm text-gray tracking-[0.2em] uppercase">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lab Preview Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24">
        <SectionTitle title="ANTIDOTE LAB" subtitle="UPGRADE. MUTATE. SURVIVE." />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          {previewNFTs.map((nft) => (
            <AntidoteCard key={nft.id} nft={nft} actionLabel="VIEW DETAILS" />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/inventory" className="text-green font-tech tracking-widest border-b border-green pb-1 hover:text-green-bright transition-colors">
            VIEW ALL ANTIDOTES
          </Link>
        </div>
      </section>
    </div>
  );
}
