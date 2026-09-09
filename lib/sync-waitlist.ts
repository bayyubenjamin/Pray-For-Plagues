import { completeTask } from "./points";
import { saveWaitlist, type LocalWaitlist } from "./waitlist-local";

export async function syncWaitlistFromServer(xHandle?: string | null): Promise<LocalWaitlist> {
  if (!xHandle) return { joined: false };
  const res = await fetch(`/api/waitlist?x=${encodeURIComponent(xHandle)}`);
  const json = await res.json();
  if (!json.entry) return { joined: false };
  const row = json.entry as { wallet: string; x_handle: string; email: string };
  const saved: LocalWaitlist = {
    joined: true,
    wallet: row.wallet,
    xHandle: row.x_handle,
    email: row.email,
  };
  saveWaitlist(saved);
  completeTask("waitlist", { wallet: row.wallet, xHandle: row.x_handle });
  completeTask("connect_x", { xHandle: row.x_handle, wallet: row.wallet });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
  return saved;
}
