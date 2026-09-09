export const OFFICIAL_X = "pfphood";
export const PINNED_POST =
  "https://x.com/pfphood/status/2087962447110148558";

export const SOCIAL_ACTIONS = [
  { id: "follow_x" as const, label: "FOLLOW", href: `https://x.com/${OFFICIAL_X}`, points: 50 },
  { id: "like_post" as const, label: "LIKE", href: PINNED_POST, points: 25 },
  { id: "repost_post" as const, label: "REPOST", href: PINNED_POST, points: 25 },
  { id: "comment_post" as const, label: "COMMENT", href: PINNED_POST, points: 25 },
];
