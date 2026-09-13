const KEY = "pfp-social-done";

export function loadSocialDone(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markSocialDone(id: string) {
  const next = Array.from(new Set([...loadSocialDone(), id]));
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
