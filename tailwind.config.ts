import type { Config } from "tailwindcss";

const config: Config = {
  // PASTIKAN BAGIAN INI SAMA PERSIS:
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Tambahkan baris ini untuk berjaga-jaga
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        deep: "#050705",
        darkGreen: "#071407",
        green: {
          DEFAULT: "#00C805",
          bright: "#39FF14",
          muted: "#4F7F4F",
        },
        white: "#E8E8E8",
        gray: "#777777",
      },
      fontFamily: {
        bangers: ["var(--font-bangers)", "cursive"],
        tech: ["var(--font-share-tech-mono)", "monospace"],
      },
      backgroundImage: {
        'scanline': 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,200,5,0.02) 50%, rgba(0,200,5,0.02))',
      },
      backgroundSize: {
        'scanline': '100% 4px',
      }
    },
  },
  plugins: [],
};
export default config;
