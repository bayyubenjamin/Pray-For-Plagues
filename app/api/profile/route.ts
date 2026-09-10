import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { upsertProfile } from "@/lib/profile-upsert";

const FIND = `
  query FindUser($x: String!, $wallet: String!) {
    profiles(where: { x_handle: { _ilike: $x } }, limit: 1) {
      x_handle email wallet connected_wallet points
    }
    waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      x_handle email wallet points
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

  const data = await nhostAdminRequest<{
    profiles: Record<string, string>[];
    waitlist: Record<string, string>[];
    waitlist_wallet: { x_handle: string; wallet: string }[];
  }>(FIND, { x: x || "__none__", wallet: wallet || "__none__" });

  const profile = data.profiles[0] || null;
  const waitlist = data.waitlist[0] || null;
  const pw = (profile?.wallet || "").toLowerCase();
  const ww = (waitlist?.wallet || "").toLowerCase();
  const cw = (profile?.connected_wallet || "").toLowerCase();

  const mismatch = {
    profileVsWaitlistWallet: Boolean(pw && ww && pw !== ww),
    connectedVsProfileWallet: Boolean(cw && pw && cw !== pw),
    connectedVsWaitlistWallet: Boolean(wallet && ww && wallet !== ww),
    waitlistWalletOwner: data.waitlist_wallet[0]?.x_handle || null,
  };

  return NextResponse.json({ profile, waitlist, mismatch });
}

export async function POST(req: Request) {
  if (!isNhostConfigured) {
    return NextResponse.json({ error: "Nhost not configured" }, { status: 503 });
  }
  const body = await req.json();
  const xHandle = String(body.xHandle ?? "").replace(/^@/, "").toLowerCase();
  if (!xHandle) return NextResponse.json({ error: "Missing X" }, { status: 400 });

  await upsertProfile({
    xHandle,
    wallet: body.wallet,
    email: body.email,
    connectedWallet: body.connectedWallet,
    points: Number(body.points ?? 0),
  });

  return NextResponse.json({ ok: true });
}
