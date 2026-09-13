import { completeTask, uncompleteTask } from "./points";
import { clearWaitlist, saveWaitlist, type LocalWaitlist } from "./waitlist-local";
import { getXSession } from "./x-session";

export async function syncWaitlistFromServer(xHandle?: string | null): Promise<LocalWaitlist> {
  const handle = (xHandle || getXSession() || "").replace(/^@/, "").toLowerCase();

  if (!handle) {
    saveWaitlist({ joined: false });
    return { joined: false };
  }

  try {
    const res = await fetch(`/api/waitlist?x=${encodeURIComponent(handle)}`);
    const json = await res.json();

    if (!json.entry) {
      uncompleteTask("waitlist");
      saveWaitlist({ joined: false });
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
    return { joined: false };
  }
}
