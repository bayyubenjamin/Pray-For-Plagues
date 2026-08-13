import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Prepared for real integration later
export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});
