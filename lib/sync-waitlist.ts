import { completeTask, loadPlayer, savePlayer, uncompleteTask } from "./points";
import { clearWaitlist, saveWaitlist, type LocalWaitlist } from "./waitlist-local";
import { clearXSession, getXSession } from "./x-session";

function wipeIdentity() {
  const current = loadPlayer();
  savePlayer({
    completed: current.completed.filter(
      (id) => !["connect_x", "waitlist", "connect_wallet", "robinhood_chain"].includes(id)
    ),
    points: 0,
  });
  clearWaitlist();
  saveWaitlist({ joined: false });
  clearXSession();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
}

export async function syncWaitlistFromServer(xHandle?: string | null): Promise<LocalWaitlist> {
  const session = getXSession();

  if (!xHandle) {
    if (!session) wipeIdentity();
    else {
      saveWaitlist({ joined: false });
      uncompleteTask("waitlist");
    }
    if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
    return { joined: false };
  }

  try {
    const res = await fetch(`/api/waitlist?x=${encodeURIComponent(xHandle)}`);
    const json = await res.json();

    if (!json.entry) {
      uncompleteTask("waitlist");
      saveWaitlist({ joined: false });
      if (session !== xHandle.toLowerCase()) wipeIdentity();
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
