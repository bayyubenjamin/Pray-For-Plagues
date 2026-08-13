import type { Metadata } from "next";
import { Bangers, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";

const bangers = Bangers({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-bangers',
});

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ["latin"],
  variable: '--font-share-tech-mono',
});

export const metadata: Metadata = {
  title: "PRAY FOR PLAGUES",
  description: "THE PLAGUE HAS ARRIVED ON ROBINHOOD CHAIN.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${shareTechMono.variable} font-tech antialiased min-h-screen flex flex-col relative`}>
        <BackgroundEffects />
        <Navbar />
        <main className="flex-grow z-10 relative pb-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
