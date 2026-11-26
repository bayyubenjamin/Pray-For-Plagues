import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import ClickSound from "@/components/ClickSound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";
import Providers from "@/components/Providers";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: "PRAY FOR PLAGUES",
  description: "THE PLAGUE HAS ARRIVED ON ROBINHOOD CHAIN.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${shareTechMono.variable} font-tech antialiased min-h-screen flex flex-col relative bg-black text-white`}
      >
        <Providers>
          <BackgroundEffects />
          <Navbar />
          <main className="flex-grow z-10 relative pt-24 pb-20">
            {children}
            <BackgroundMusic />
            <ClickSound />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
