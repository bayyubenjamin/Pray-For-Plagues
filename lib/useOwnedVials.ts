"use client";

import { useEffect, useState } from "react";
import { isVialContractConfigured, readOwnedVialCount, readOwnedTokenIds } from "./vial-contract";

export type OwnedVials =
  | { status: "no-wallet"; count: 0; tokenIds: number[] }
  | { status: "not-minted"; count: 0; tokenIds: number[] }
  | { status: "loading"; count: 0; tokenIds: number[] }
  | { status: "live"; count: number; tokenIds: number[] }
  | { status: "error"; count: 0; tokenIds: number[] };

/**
 * How many vials the connected wallet actually holds, read on-chain, plus
 * the held token ids (ERC721Enumerable) for the Lab selector.
 * - no wallet connected → "no-wallet"
 * - collection contract not deployed yet → "not-minted" (count 0, honest)
 * - contract set → real balanceOf + tokenOfOwnerByIndex from the Robinhood RPC
 *   (tokenIds is [] if the collection is not enumerable — the Lab then
 *   falls back to manual token-id entry)
 *
 * The no-wallet / not-minted states are derived during render (not set in
 * an effect), so the hook adds no new lint errors.
 */
export function useOwnedVials(address: string | undefined): OwnedVials {
  const [live, setLive] = useState<OwnedVials>({ status: "loading", count: 0, tokenIds: [] });

  useEffect(() => {
    if (!address || !isVialContractConfigured()) return;
    let cancelled = false;
    Promise.all([readOwnedVialCount(address), readOwnedTokenIds(address)])
      .then(([count, tokenIds]) => {
        if (!cancelled) setLive({ status: "live", count, tokenIds });
      })
      .catch(() => {
        if (!cancelled) setLive({ status: "error", count: 0, tokenIds: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address) return { status: "no-wallet", count: 0, tokenIds: [] };
  if (!isVialContractConfigured()) return { status: "not-minted", count: 0, tokenIds: [] };
  return live;
}
