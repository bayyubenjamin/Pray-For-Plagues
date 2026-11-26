import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed X session cookie (server-side proof that the caller really
 * connected a given X account through OAuth).
 *
 * The X callback issues `pfp_x_session` after exchanging the code and
 * reading /2/users/me. Write routes (join, social, profile POST) and the
 * PII read (profile GET) require the cookie's handle to match the handle
 * in the request. Without this, anyone could POST as any handle
 * (handle-squatting, wiping someone's social_tasks, overwriting identity).
 *
 * Rollout: if SESSION_SECRET is not configured, verification is disabled
 * and routes fall back to the legacy (unauthenticated) behaviour with a
 * server warning — so the site keeps working until the secret is set in
 * Vercel. Once the secret is set, a missing/invalid cookie is a 401.
 */

export const SESSION_COOKIE = "pfp_x_session";
const SESSION_DAYS = 30;

export type XSession = {
  handle: string;
  xUserId: string;
  exp: number;
};

function getSecret(): string {
  return process.env.SESSION_SECRET || "";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signSession(handle: string, xUserId: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = b64url(
    JSON.stringify({
      handle: handle.toLowerCase(),
      xUserId,
      exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 3600,
    }),
  );
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(cookieValue: string | undefined | null): XSession | null {
  if (!cookieValue) return null;
  const secret = getSecret();
  if (!secret) return null;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as XSession;
    if (!parsed.handle || !parsed.exp || parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function sessionCookieHeader(value: string): string {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 3600}`;
}

export function isSessionEnforced(): boolean {
  return Boolean(getSecret());
}

/**
 * Check the request's session cookie against the handle it claims.
 * Returns null when the call may proceed, or an error body + status.
 * - No secret configured: always proceeds (legacy behaviour, warn once).
 * - Secret configured + valid cookie matching the handle: proceeds.
 * - Otherwise: 401, the UI should ask the user to reconnect X.
 */
export function requireSession(
  req: Request,
  handle: string,
): { error: string; status: number } | null {
  if (!isSessionEnforced()) {
    console.warn("[session] SESSION_SECRET not set — X identity is not verified server-side");
    return null;
  }
  const cookie = req.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const session = verifySession(match ? match.slice(SESSION_COOKIE.length + 1) : null);
  if (!session || session.handle.toLowerCase() !== handle.toLowerCase()) {
    return { error: "Reconnect X to continue", status: 401 };
  }
  return null;
}
