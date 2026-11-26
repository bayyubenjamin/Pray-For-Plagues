// Server point model (the only points that exist — the server is the
// authority, and the UI shows server points):
//   JOIN WAITLIST .......... +150
//   SOCIAL TASKS (4) ....... +50 / +25 / +25 / +25 = +125 max
//   REFERRAL (per invitee) . +200, paid once when the invitee finishes
//                            4 social tasks (validated in POST /api/social)
// CONNECT WALLET / ROBINHOOD CHAIN / CONNECT X are progress steps, not
// point awards — they used to carry 100/150/200 points in this list while
// the server never credited them, so local and server points never agreed.
// They are 0 here now. `visit_lab` is removed: no code ever completed it.
export const TASKS = [
  { id: "connect_wallet", label: "CONNECT WALLET", points: 0, hint: "Link an EVM wallet" },
  { id: "robinhood_chain", label: "SWITCH TO ROBINHOOD CHAIN", points: 0, hint: "Network 4663" },
  { id: "connect_x", label: "CONNECT X", points: 0, hint: "Link your X account" },
  { id: "follow_x", label: "FOLLOW @PFPHOOD", points: 50, hint: "Follow official X" },
  { id: "like_post", label: "LIKE POST", points: 25, hint: "Like official post" },
  { id: "repost_post", label: "REPOST", points: 25, hint: "Repost official post" },
  { id: "comment_post", label: "COMMENT", points: 25, hint: "Reply official post" },
  { id: "waitlist", label: "JOIN WAITLIST", points: 150, hint: "Reserve lab access" },
] as const;

export type TaskId = (typeof TASKS)[number]["id"] | string;

// Single source of truth for point values. Server routes must import from
// here (or from lib/social.ts, which derives from here) — never hardcode a
// second copy of these numbers in an API route.
export const WAITLIST_POINTS = 150;

export function pointsForTask(id: string): number {
  return TASKS.find((t) => t.id === id)?.points ?? 0;
}

/** Server-side total for a set of social task ids (deduped, unknown ids = 0). */
export function socialPointsFor(ids: string[]): number {
  return [...new Set(ids)].reduce((sum, id) => sum + pointsForTask(id), 0);
}

export type PlayerState = {
  wallet?: string;
  xHandle?: string;
  completed: string[];
  points: number;
};

const KEY = "pfp-player";

export function loadPlayer(): PlayerState {
  if (typeof window === "undefined") return { completed: [], points: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { completed: [], points: 0 };
    return JSON.parse(raw) as PlayerState;
  } catch {
    return { completed: [], points: 0 };
  }
}

export function savePlayer(state: PlayerState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function completeTask(id: TaskId, extra?: Partial<PlayerState>): PlayerState {
  const current = loadPlayer();
  if (current.completed.includes(id)) {
    const next = { ...current, ...extra };
    savePlayer(next);
    syncRank(next);
    return next;
  }
  const task = TASKS.find((t) => t.id === id);
  const next: PlayerState = {
    ...current,
    ...extra,
    completed: [...current.completed, id],
    points: current.points + (task?.points ?? 0),
  };
  savePlayer(next);
  syncRank(next);
  return next;
}

export function completeCustomTask(id: string, points: number): PlayerState {
  const current = loadPlayer();
  if (current.completed.includes(id)) return current;
  const next: PlayerState = {
    ...current,
    completed: [...current.completed, id],
    points: current.points + points,
  };
  savePlayer(next);
  syncRank(next);
  return next;
}

export function uncompleteTask(id: TaskId): PlayerState {
  const current = loadPlayer();
  if (!current.completed.includes(id)) return current;
  const task = TASKS.find((t) => t.id === id);
  const next: PlayerState = {
    ...current,
    completed: current.completed.filter((x) => x !== id),
    points: Math.max(0, current.points - (task?.points ?? 0)),
  };
  savePlayer(next);
  return next;
}

/**
 * Refresh local points from the server. READ-ONLY: this never sends points
 * to the server — the server is the only authority for waitlist points
 * (see POST /api/rank). Local task progress stays in localStorage; if the
 * server reports a higher total (e.g. a referral award), adopt it.
 */
function syncRank(state: PlayerState) {
  if (typeof window === "undefined") return;
  const x = (state.xHandle || "").replace(/^@/, "").trim().toLowerCase();
  if (!x) return;
  fetch(`/api/rank?x=${encodeURIComponent(x)}`)
    .then((r) => r.json())
    .then((json: { points?: unknown; rank?: unknown }) => {
      const serverPoints = typeof json?.points === "number" ? json.points : 0;
      if (json?.rank != null && serverPoints > 0) {
        const current = loadPlayer();
        if (serverPoints > current.points) {
          savePlayer({ ...current, points: serverPoints });
        }
      }
    })
    .catch(() => {});
}
