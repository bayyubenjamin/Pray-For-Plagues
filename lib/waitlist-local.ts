const KEY = "pfp-waitlist";

export type LocalWaitlist = {
  joined: boolean;
  wallet?: string;
  xHandle?: string;
  email?: string;
};

export function loadWaitlist(): LocalWaitlist {
  if (typeof window === "undefined") return { joined: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { joined: false };
    return JSON.parse(raw) as LocalWaitlist;
  } catch {
    return { joined: false };
  }
}

export function saveWaitlist(data: LocalWaitlist) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
