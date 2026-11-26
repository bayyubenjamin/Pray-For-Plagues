import { createPublicClient, http } from "viem";
import { robinhoodChain } from "./config";

/**
 * Lab contracts (Robinhood Chain 4663) — the on-chain upgrade terminal.
 *
 * Both addresses come from env and are UNSET until the contracts deploy:
 *   NEXT_PUBLIC_LAB_CONTRACT     — the Lab operator (mutate + extract)
 *   NEXT_PUBLIC_PLAGUES_TOKEN    — the $PLAGUES ERC-20 (balance read only)
 *
 * While unset, the Lab page renders the full terminal with every action
 * honestly sealed ("CONTRACT NOT DEPLOYED"). Once the addresses are set
 * (env vars only, no code change), the same buttons write real
 * transactions through wagmi.
 *
 * DRAFT INTERFACE — the function names and argument order below are the
 * prepared interface for the Lab contract. They MUST match the deployed
 * contract; if the real contract names a function differently (e.g.
 * `upgrade` instead of `mutate`, or a different stat encoding), update
 * this file before the buttons go live, or the calls will revert.
 */
export const LAB_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_LAB_CONTRACT || "").trim();
export const PLAGUES_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_PLAGUES_TOKEN || "").trim();

export function isLabConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(LAB_CONTRACT_ADDRESS);
}

export function isPlaguesConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(PLAGUES_TOKEN_ADDRESS);
}

export function blockscoutTxUrl(hash: string): string {
  return `https://robinhoodchain.blockscout.com/tx/${hash}`;
}

/** Mutate stat ids, in the order the draft Lab ABI expects them. */
export const MUTATE_STATS = ["PURITY", "STABILITY", "POTENCY"] as const;
export type MutateStat = (typeof MUTATE_STATS)[number];

export const LAB_ABI = [
  {
    type: "function",
    name: "mutate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "stat", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "extract",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
] as const;

const ERC20_BALANCE_OF = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

let client: ReturnType<typeof createPublicClient> | null = null;

function getClient() {
  if (!client) {
    client = createPublicClient({
      chain: robinhoodChain,
      transport: http("https://rpc.mainnet.chain.robinhood.com"),
    });
  }
  return client;
}

/** The connected wallet's $PLAGUES balance, in whole tokens (2 decimals shown). Returns null when the token is not configured or the read fails. */
export async function readPlaguesBalance(wallet: string): Promise<number | null> {
  if (!isPlaguesConfigured()) return null;
  try {
    const [raw, decimals] = await Promise.all([
      getClient().readContract({
        address: PLAGUES_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_BALANCE_OF,
        functionName: "balanceOf",
        args: [wallet as `0x${string}`],
      }),
      getClient().readContract({
        address: PLAGUES_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_BALANCE_OF,
        functionName: "decimals",
      }),
    ]);
    return Number(raw) / 10 ** Number(decimals);
  } catch {
    return null;
  }
}
