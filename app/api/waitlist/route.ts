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
      id wallet email x_handle status
    }
  }
`;

const FIND = `
  query FindWaitlist($x: String!, $wallet: String!, $email: String!) {
    by_x: waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      id wallet email x_handle
    }
    by_wallet: waitlist(where: { wallet: { _ilike: $wallet } }, limit: 1) {
      id wallet email x_handle
    }
    by_email: waitlist(where: { email: { _ilike: $email } }, limit: 1) {
      id wallet email x_handle
    }
  }
`;

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function normalizeWallet(value: string) {
  return value.trim().toLowerCase();
}

async function lookup(x: string, wallet: string, email: string) {
  return nhostAdminRequest<{
    by_x: { id: string; wallet: string; email: string; x_handle: string }[];
    by_wallet: { id: string; wallet: string; email: string; x_handle: string }[];
    by_email: { id: string; wallet: string; email: string; x_handle: string }[];
  }>(FIND, {
    x: x || "__none__",
    wallet: wallet || "__none__",
    email: email || "__none__",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const wallet = normalizeWallet(String(body.wallet ?? ""));
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
      return NextResponse.json({ error: "Nhost backend is not configured" }, { status: 503 });
    }

    const existing = await lookup(xHandle, wallet, email);

    if (existing.by_wallet[0]) {
      return NextResponse.json(
        { error: "Wallet already used", field: "wallet", taken: true },
        { status: 409 }
      );
    }
    if (existing.by_x[0]) {
      return NextResponse.json(
        { error: "This X account already joined", field: "x", taken: true },
        { status: 409 }
      );
    }
    if (existing.by_email[0]) {
      return NextResponse.json(
        { error: "This email already joined", field: "email", taken: true },
        { status: 409 }
      );
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
    if (/unique|uniqueness|constraint/i.test(message)) {
      return NextResponse.json({ error: "Wallet already used", field: "wallet", taken: true }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const xHandle = (url.searchParams.get("x") || "").replace(/^@/, "").trim().toLowerCase();
  const wallet = normalizeWallet(url.searchParams.get("wallet") || "");
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();

  if (!isNhostConfigured) {
    return NextResponse.json({ ok: false, error: "Nhost backend is not configured" }, { status: 503 });
  }

  try {
    const existing = await lookup(xHandle, wallet, email);
    const walletTaken = Boolean(existing.by_wallet[0]);
    const row = existing.by_x[0] || existing.by_wallet[0] || existing.by_email[0] || null;
    return NextResponse.json({
      ok: true,
      walletTaken,
      xTaken: Boolean(existing.by_x[0]),
      emailTaken: Boolean(existing.by_email[0]),
      lockedWallet: existing.by_x[0]?.wallet ?? existing.by_wallet[0]?.wallet ?? null,
      entry: row,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
