"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { NhostProvider } from "@nhost/nextjs";
import { useState } from "react";
import { wagmiConfig } from "@/lib/config";
import { nhost } from "@/lib/nhost";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NhostProvider nhost={nhost}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </NhostProvider>
  );
}
