export const REFERRAL_POINTS = 200;
export const REF_KEY = "pfp-ref";

export function saveRef(code: string) {
  if (typeof window === "undefined") return;
  const clean = code.replace(/^@/, "").trim().toLowerCase();
  if (clean) localStorage.setItem(REF_KEY, clean);
}

export function loadRef() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(REF_KEY) || "";
}
