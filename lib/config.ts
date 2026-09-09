import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

/** Robinhood Chain placeholder — update chainId + RPC when official values land. */
export const robinhoodChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 1),
  name: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://cloudflare-eth.com"],
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [injected()],
  transports: {
    [robinhoodChain.id]: http(),
  },
  ssr: true,
});
