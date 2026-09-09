export const TASKS = [
  { id: "connect_wallet", label: "CONNECT WALLET", points: 100, hint: "Link an EVM wallet" },
  { id: "robinhood_chain", label: "SWITCH TO ROBINHOOD CHAIN", points: 150, hint: "Network 4663" },
  { id: "connect_x", label: "CONNECT X", points: 200, hint: "Link your X account" },
  { id: "follow_x", label: "FOLLOW @PFPHOOD", points: 50, hint: "Follow official X" },
  { id: "like_post", label: "LIKE POST", points: 25, hint: "Like official post" },
  { id: "repost_post", label: "REPOST", points: 25, hint: "Repost official post" },
  { id: "comment_post", label: "COMMENT", points: 25, hint: "Reply official post" },
  { id: "waitlist", label: "JOIN WAITLIST", points: 150, hint: "Reserve lab access" },
  { id: "visit_lab", label: "ENTER THE LAB", points: 50, hint: "Open Upgrade once" },
] as const;

export type TaskId = (typeof TASKS)[number]["id"];

export type PlayerState = {
  wallet?: string;
  xHandle?: string;
  completed: TaskId[];
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

function syncRank(state: PlayerState) {
  if (typeof window === "undefined") return;
  if (!state.xHandle && !state.wallet) return;
  fetch("/api/rank", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      xHandle: state.xHandle,
      wallet: state.wallet,
      points: state.points,
    }),
  }).catch(() => {});
}
