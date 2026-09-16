import SectionTitle from "@/components/SectionTitle";
import AntidoteCard from "@/components/AntidoteCard";
import ScrollReveal from "@/components/ScrollReveal";
import EnterLabButton from "@/components/EnterLabButton";
import ProtocolRoadmap from "@/components/ProtocolRoadmap";
import { MOCK_NFTS } from "@/lib/mockData";
import { OPENSEA_MINT } from "@/lib/protocol";
import Link from "next/link";

export default function Home() {
  const previewNFTs = MOCK_NFTS.filter((n) =>
    (["MYTHIC", "LEGENDARY", "EPIC", "RARE"] as const).includes(
      n.rarity as "MYTHIC" | "LEGENDARY" | "EPIC" | "RARE"
    )
  ).slice(0, 4);

  return (
    <div className="flex flex-col items-center w-full">
      <section className="w-full min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <ScrollReveal className="text-center max-w-4xl mx-auto z-20 flex flex-col items-center gap-4 sm:gap-6 mt-16 sm:mt-0">
          <h1 className="font-bangers text-4xl sm:text-7xl md:text-[5rem] text-green tracking-wider text-aura leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            PRAY FOR PLAGUES
          </h1>
          <p className="font-tech text-[8px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase max-w-2xl px-4 sm:px-6 py-2 card-panel border border-green/30 box-aura">
            THE PLAGUE HAS ARRIVED ON <span className="text-green font-bold">ROBINHOOD</span> CHAIN.
          </p>
          <p className="font-tech text-[10px] sm:text-xs tracking-[0.2em] text-gray uppercase">
            Mint on OpenSea. Use the vial here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 w-full sm:w-auto px-6 sm:px-0">
            <EnterLabButton className="px-8 sm:px-10 py-3.5 sm:py-4 bg-green text-black font-tech font-bold text-sm sm:text-lg tracking-[0.2em] hover:bg-green-bright transition-colors uppercase text-center box-aura" />
            <Link
              href="/inventory"
              className="px-8 sm:px-10 py-3.5 sm:py-4 card-panel border border-green text-green font-tech font-bold text-sm sm:text-lg tracking-[0.2em] hover:bg-darkGreen transition-colors uppercase text-center box-aura"
            >
              INVENTORY
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <ScrollReveal>
          <SectionTitle title="OUTBREAK PROTOCOL" subtitle="MINT ON OPENSEA · UTILITY ON THIS LAB" />
        </ScrollReveal>
        <ScrollReveal>
          <ProtocolRoadmap />
        </ScrollReveal>
        <div className="text-center mt-8">
          <a href={OPENSEA_MINT} target="_blank" rel="noreferrer" className="font-tech text-xs tracking-widest text-green hover:text-green-bright">
            OPENSEA MINT →
          </a>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <ScrollReveal>
          <SectionTitle title="ANTIDOTE UTILITY" subtitle="WHAT A HELD VIAL DOES" />
        </ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {previewNFTs.map((nft, index) => (
            <ScrollReveal key={nft.id} delay={index * 100}>
              <AntidoteCard nft={nft} compact briefing action="LOCKED" />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/inventory" className="font-tech text-xs tracking-widest text-green hover:text-green-bright">
            OPEN INVENTORY →
          </Link>
        </div>
      </section>
    </div>
  );
}
