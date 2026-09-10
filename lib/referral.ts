export const REFERRAL_POINTS = 200;
export const REF_KEY = "pfp-ref";

function clean(code: string) {
  return code.replace(/^@/, "").trim().toLowerCase();
}

export function saveRef(code: string, ownHandle?: string) {
  if (typeof window === "undefined") return;
  const value = clean(code);
  const own = ownHandle ? clean(ownHandle) : "";
  if (!value || (own && value === own)) {
    localStorage.removeItem(REF_KEY);
    return;
  }
  localStorage.setItem(REF_KEY, value);
}

export function loadRef(ownHandle?: string) {
  if (typeof window === "undefined") return "";
  const value = localStorage.getItem(REF_KEY) || "";
  const own = ownHandle ? clean(ownHandle) : "";
  if (own && value === own) {
    localStorage.removeItem(REF_KEY);
    return "";
  }
  return value;
}

export function captureRefFromUrl(ownHandle?: string) {
  if (typeof window === "undefined") return loadRef(ownHandle);
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) saveRef(ref, ownHandle);
  return loadRef(ownHandle);
}
