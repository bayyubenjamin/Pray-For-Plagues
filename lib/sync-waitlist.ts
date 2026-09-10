import { completeTask, uncompleteTask } from "./points";
import { saveWaitlist, type LocalWaitlist } from "./waitlist-local";

export async function syncWaitlistFromServer(xHandle?: string | null): Promise<LocalWaitlist> {
  if (!xHandle) {
    saveWaitlist({ joined: false });
    uncompleteTask("waitlist");
    if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
    return { joined: false };
  }
  try {
    const res = await fetch(`/api/waitlist?x=${encodeURIComponent(xHandle)}`);
    const json = await res.json();
    if (!json.entry) {
      saveWaitlist({ joined: false });
      uncompleteTask("waitlist");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
      return { joined: false };
    }
    const row = json.entry as { wallet: string; x_handle: string; email: string };
    const saved: LocalWaitlist = {
      joined: true,
      wallet: String(row.wallet).toLowerCase(),
      xHandle: row.x_handle,
      email: row.email,
    };
    saveWaitlist(saved);
    completeTask("waitlist", { wallet: saved.wallet, xHandle: row.x_handle });
    completeTask("connect_x", { xHandle: row.x_handle, wallet: saved.wallet });
    if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
    return saved;
  } catch {
    saveWaitlist({ joined: false });
    return { joined: false };
  }
}
