import { pointsForTask } from "./points";

export const OFFICIAL_X = "pfphood";
export const PINNED_POST =
  "https://x.com/pfphood/status/2087962447110148558";

// Point values are derived from lib/points.ts (TASKS) — the single source of
// truth. Do not hardcode a second copy of these numbers here or in API routes.
export const SOCIAL_ACTIONS = [
  { id: "follow_x" as const, label: "FOLLOW", href: `https://x.com/${OFFICIAL_X}`, points: pointsForTask("follow_x") },
  { id: "like_post" as const, label: "LIKE", href: PINNED_POST, points: pointsForTask("like_post") },
  { id: "repost_post" as const, label: "REPOST", href: PINNED_POST, points: pointsForTask("repost_post") },
  { id: "comment_post" as const, label: "COMMENT", href: PINNED_POST, points: pointsForTask("comment_post") },
];

export const SOCIAL_TASK_IDS = SOCIAL_ACTIONS.map((a) => a.id);
