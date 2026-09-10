import { completeTask, loadPlayer, savePlayer, uncompleteTask } from "./points";
import { clearWaitlist, loadWaitlist, saveWaitlist, type LocalWaitlist } from "./waitlist-local";

function logoutLocal() {
  const player = loadPlayer();
  uncompleteTask("waitlist");
  savePlayer({
    ...loadPlayer(),
    xHandle: undefined,
    wallet: undefined,
    completed: loadPlayer().completed.filter((id) => id !== "connect_x" && id !== "waitlist" && id !== "connect_wallet" && id !== "robinhood_chain"),
  });
  // recompute points simply from remaining tasks
  const left = loadPlayer();
  void player;
  clearWaitlist();
  saveWaitlist({ joined: false });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
  return left;
}

export async function syncWaitlistFromServer(xHandle?: string | null): Promise<LocalWaitlist> {
  const cached = loadWaitlist();

  if (!xHandle) {
    if (cached.joined) logoutLocal();
    else {
      clearWaitlist();
      saveWaitlist({ joined: false });
    }
    if (typeof window !== "undefined") window.dispatchEvent(new Event("pfp-waitlist"));
    return { joined: false };
  }

  try {
    const res = await fetch(`/api/waitlist?x=${encodeURIComponent(xHandle)}`);
    const json = await res.json();

    if (!json.entry) {
      if (cached.joined) {
        logoutLocal();
      } else {
        saveWaitlist({ joined: false });
        uncompleteTask("waitlist");
      }
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
