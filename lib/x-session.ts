const KEY = "pfp-x-session";

export function setXSession(handle: string) {
  sessionStorage.setItem(KEY, handle.replace(/^@/, "").toLowerCase());
}

export function getXSession() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(KEY) || "";
}

export function clearXSession() {
  sessionStorage.removeItem(KEY);
}
