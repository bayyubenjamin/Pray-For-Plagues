import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { upsertProfile } from "@/lib/profile-upsert";
import { requireSession } from "@/lib/session";

const FIND = `
  query FindUser($x: String!, $wallet: String!) {
    profiles(where: { x_handle: { _ilike: $x } }, limit: 1) {
      x_handle email wallet connected_wallet points
    }
    waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      x_handle email wallet points created_at
    }
    waitlist_wallet: waitlist(where: { wallet: { _ilike: $wallet } }, limit: 1) {
      x_handle wallet
    }
  }
`;

export async function GET(req: Request) {
  if (!isNhostConfigured) {
    return NextResponse.json({ profile: null, waitlist: null, mismatch: null });
  }
  const url = new URL(req.url);
  const x = (url.searchParams.get("x") || "").replace(/^@/, "").toLowerCase();
  const wallet = (url.searchParams.get("wallet") || "").toLowerCase();

  if (!x && !wallet) return NextResponse.json({ profile: null, waitlist: null });

  // Email + wallet are PII: when the session secret is configured, only the
  // owner of the X handle may read them. (Before this, anyone could fetch
  // any handle's email + wallet with no login at all.)
  if (x) {
    const denied = requireSession(req, x);
    if (denied) return NextResponse.json({ error: denied.error, sessionRequired: true }, { status: denied.status });
  }

  try {
    const data = await nhostAdminRequest<{
      profiles: Record<string, string>[];
      waitlist: Record<string, string>[];
      waitlist_wallet: { x_handle: string; wallet: string }[];
    }>(FIND, { x: x || "__none__", wallet: wallet || "__none__" });

    const rawProfile = data.profiles[0] || null;
    const waitlist = data.waitlist[0] || null;
    const profile = rawProfile || waitlist
      ? {
          x_handle: rawProfile?.x_handle || waitlist?.x_handle,
          email: rawProfile?.email || waitlist?.email || "",
          wallet: rawProfile?.wallet || waitlist?.wallet || "",
          connected_wallet: rawProfile?.connected_wallet || "",
          points: waitlist?.points ?? rawProfile?.points ?? 0,
        }
      : null;

    const pw = (profile?.wallet || "").toLowerCase();
    const ww = (waitlist?.wallet || "").toLowerCase();
    const cw = (profile?.connected_wallet || "").toLowerCase();

    const mismatch = {
      profileVsWaitlistWallet: Boolean(pw && ww && pw !== ww),
      connectedVsProfileWallet: Boolean(cw && pw && cw !== pw),
      connectedVsWaitlistWallet: Boolean(wallet && ww && wallet !== ww),
      waitlistWalletOwner: data.waitlist_wallet[0]?.x_handle || null,
    };

    return NextResponse.json({
      profile,
      waitlist,
      mismatch,
      joinedAt: waitlist?.created_at || null,
    });
  } catch (err) {
    // A failed sub-query used to 500 the whole profile (the old `referrals`
    // sub-query referenced a table that does not exist, so every profile
    // read failed). Never fail the whole read for one bad lookup again.
    console.error("[profile] GET failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ profile: null, waitlist: null, mismatch: null });
  }
}

export async function POST(req: Request) {
  if (!isNhostConfigured) {
    return NextResponse.json({ error: "Nhost not configured" }, { status: 503 });
  }
  const body: unknown = await req.json().catch(() => ({}));
  const obj = (body ?? {}) as Record<string, unknown>;
  const xHandle = String(obj.xHandle ?? "").replace(/^@/, "").toLowerCase();
  if (!xHandle) return NextResponse.json({ error: "Missing X" }, { status: 400 });

  const denied = requireSession(req, xHandle);
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  // Deliberately NO points here: client-supplied points are never trusted.
  // upsertProfile without `points` leaves the points column untouched.
  await upsertProfile({
    xHandle,
    wallet: typeof obj.wallet === "string" ? obj.wallet : null,
    email: typeof obj.email === "string" ? obj.email : null,
    connectedWallet:
      typeof obj.connectedWallet === "string" ? obj.connectedWallet : null,
  });

  return NextResponse.json({ ok: true });
}
