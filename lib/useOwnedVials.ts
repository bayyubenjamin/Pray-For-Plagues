"use client";

import { useEffect, useState } from "react";
import { isVialContractConfigured, readOwnedVialCount } from "./vial-contract";

export type OwnedVials =
  | { status: "no-wallet"; count: 0 }
  | { status: "not-minted"; count: 0 }
  | { status: "loading"; count: 0 }
  | { status: "live"; count: number }
  | { status: "error"; count: 0 };

/**
 * How many vials the connected wallet actually holds, read on-chain.
 * - no wallet connected → "no-wallet"
 * - collection contract not deployed yet → "not-minted" (count 0, honest)
 * - contract set → real balanceOf from the Robinhood RPC
 *
 * The no-wallet / not-minted states are derived during render (not set in
 * an effect), so the hook adds no new lint errors.
 */
export function useOwnedVials(address: string | undefined): OwnedVials {
  const [live, setLive] = useState<OwnedVials>({ status: "loading", count: 0 });

  useEffect(() => {
    if (!address || !isVialContractConfigured()) return;
    let cancelled = false;
    readOwnedVialCount(address)
      .then((count) => {
        if (!cancelled) setLive({ status: "live", count });
      })
      .catch(() => {
        if (!cancelled) setLive({ status: "error", count: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address) return { status: "no-wallet", count: 0 };
  if (!isVialContractConfigured()) return { status: "not-minted", count: 0 };
  return live;
}
