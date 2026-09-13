import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";
import Providers from "@/components/Providers";

const plagueFont = localFont({
  src: "./fonts/plague.otf",
  variable: "--font-bangers",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: "PRAY FOR PLAGUES",
  description: "THE PLAGUE HAS ARRIVED ON ROBINHOOD CHAIN.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${plagueFont.variable} ${shareTechMono.variable} font-tech antialiased min-h-screen flex flex-col relative bg-black text-white`}
      >
        <Providers>
          <BackgroundEffects />
          <Navbar />
          <main className="flex-grow z-10 relative pt-24 pb-20">
            {children}
            <BackgroundMusic />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
