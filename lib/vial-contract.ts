import { createPublicClient, http } from "viem";
import { robinhoodChain } from "./config";

/**
 * Vial collection contract (Robinhood Chain 4663), set once the collection
 * is deployed and the mint is live on OpenSea.
 *
 * While NEXT_PUBLIC_VIAL_CONTRACT is unset, the ownership check honestly
 * reports NOT MINTED instead of pretending to check the chain. Once the
 * address is set (one env var, no code change), Inventory and Lab read the
 * real balanceOf for the connected wallet.
 *
 * The collection is a 2,000-piece ERC-721 (token ids 1–2000); balanceOf is
 * the only call needed for "how many vials does this wallet hold".
 */
export const VIAL_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_VIAL_CONTRACT || "").trim();

export function isVialContractConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(VIAL_CONTRACT_ADDRESS);
}

const ERC721_BALANCE_OF = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;

let client: ReturnType<typeof createPublicClient> | null = null;

export function getRobinhoodClient() {
  if (!client) {
    client = createPublicClient({
      chain: robinhoodChain,
      transport: http("https://rpc.mainnet.chain.robinhood.com"),
    });
  }
  return client;
}

export async function readOwnedVialCount(wallet: string): Promise<number> {
  const result = await getRobinhoodClient().readContract({
    address: VIAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC721_BALANCE_OF,
    functionName: "balanceOf",
    args: [wallet as `0x${string}`],
  });
  return Number(result);
}

/**
 * Token ids held by the wallet, via ERC721Enumerable tokenOfOwnerByIndex.
 * Returns [] when the collection is not enumerable, the contract is not
 * set, or the read fails — the Lab then falls back to manual token-id
 * entry instead of pretending to know the tokens.
 */
export async function readOwnedTokenIds(wallet: string, max = 50): Promise<number[]> {
  if (!isVialContractConfigured()) return [];
  try {
    const count = await readOwnedVialCount(wallet);
    const n = Math.min(count, max);
    const ids = await Promise.all(
      Array.from({ length: n }, (_, i) =>
        getRobinhoodClient().readContract({
          address: VIAL_CONTRACT_ADDRESS as `0x${string}`,
          abi: ERC721_BALANCE_OF,
          functionName: "tokenOfOwnerByIndex",
          args: [wallet as `0x${string}`, BigInt(i)],
        }),
      ),
    );
    return ids.map((id) => Number(id));
  } catch {
    return [];
  }
}
