import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";

const INSERT = `
  mutation InsertWaitlist(
    $email: String!,
    $wallet: String!,
    $x_handle: String!,
    $source: String!,
    $collection: String!
  ) {
    insert_waitlist_one(
      object: {
        email: $email,
        wallet: $wallet,
        x_handle: $x_handle,
        source: $source,
        collection: $collection,
        status: "pending"
      }
    ) {
      id
      wallet
      email
      x_handle
      status
    }
  }
`;

const FIND = `
  query FindWaitlist($x: String, $wallet: String, $email: String) {
    by_x: waitlist(where: { x_handle: { _eq: $x } }, limit: 1) { id wallet email x_handle }
    by_wallet: waitlist(where: { wallet: { _eq: $wallet } }, limit: 1) { id wallet email x_handle }
    by_email: waitlist(where: { email: { _eq: $email } }, limit: 1) { id wallet email x_handle }
  }
`;

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const wallet = String(body.wallet ?? "").trim().toLowerCase();
    const xHandle = String(body.xHandle ?? "").replace(/^@/, "").trim().toLowerCase();

    if (!xHandle) {
      return NextResponse.json({ error: "Connect X first" }, { status: 400 });
    }
    if (!isAddress(wallet)) {
      return NextResponse.json({ error: "Paste a valid wallet 0x..." }, { status: 400 });
    }
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!isNhostConfigured) {
      return NextResponse.json({ ok: true, stored: "local", wallet, email, xHandle });
    }

    const existing = await nhostAdminRequest<{
      by_x: { wallet: string; email: string; x_handle: string }[];
      by_wallet: { wallet: string; email: string; x_handle: string }[];
      by_email: { wallet: string; email: string; x_handle: string }[];
    }>(FIND, { x: xHandle, wallet, email });

    if (existing.by_x[0]) {
      return NextResponse.json({ error: "This X account already joined" }, { status: 409 });
    }
    if (existing.by_wallet[0]) {
      return NextResponse.json({ error: "This wallet already joined" }, { status: 409 });
    }
    if (existing.by_email[0]) {
      return NextResponse.json({ error: "This email already joined" }, { status: 409 });
    }

    const data = await nhostAdminRequest<{ insert_waitlist_one: { id: string } }>(INSERT, {
      email,
      wallet,
      x_handle: xHandle,
      source: "site",
      collection: "pray-for-plagues",
    });

    return NextResponse.json({ ok: true, stored: "nhost", id: data.insert_waitlist_one?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Waitlist failed";
    if (message.includes("Uniqueness") || message.includes("unique")) {
      return NextResponse.json({ error: "X, wallet, or email already used" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const xHandle = (url.searchParams.get("x") || "").replace(/^@/, "").trim().toLowerCase();
  const wallet = (url.searchParams.get("wallet") || "").trim().toLowerCase();
  if (!isNhostConfigured) return NextResponse.json({ ok: true, lockedWallet: null });
  if (!xHandle && !wallet) return NextResponse.json({ lockedWallet: null });

  try {
    const existing = await nhostAdminRequest<{
      by_x: { wallet: string; x_handle: string }[];
      by_wallet: { wallet: string; x_handle: string }[];
      by_email: { wallet: string; x_handle: string }[];
    }>(FIND, { x: xHandle || "__none__", wallet: wallet || "__none__", email: "__none__" });
    const row = existing.by_x[0] || existing.by_wallet[0] || null;
    return NextResponse.json({ ok: true, entry: row, lockedWallet: row?.wallet ?? null });
  } catch {
    return NextResponse.json({ lockedWallet: null });
  }
}
