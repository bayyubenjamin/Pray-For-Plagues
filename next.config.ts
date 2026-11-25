import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    // Serve AVIF/WebP when the browser supports them (vial art etc.).
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Media files are sometimes replaced under the same name, so no
    // immutable year-long cache: 1h fresh + 1 day stale-while-revalidate.
    // Repeat visits within the hour skip the download entirely.
    const mediaHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=3600, stale-while-revalidate=86400",
      },
    ];
    return [
      { source: "/images/:path*", headers: mediaHeaders },
      { source: "/audio/:path*", headers: mediaHeaders },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
