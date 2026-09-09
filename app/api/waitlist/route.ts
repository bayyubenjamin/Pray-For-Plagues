import { NextResponse } from "next/server";
import { nhostAdminRequest } from "@/lib/nhost-server";

const UPSERT = `
  mutation UpsertWaitlist(
    $email: String!,
    $wallet: String!,
    $x_handle: String,
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
      },
      on_conflict: {
        constraint: waitlist_wallet_key,
        update_columns: [email, x_handle, updated_at]
      }
    ) {
      id
      wallet
      email
      status
    }
    insert_profiles_one(
      object: {
        wallet: $wallet,
        email: $email,
        x_handle: $x_handle,
        points: 150
      },
      on_conflict: {
        constraint: profiles_wallet_key,
        update_columns: [email, x_handle, updated_at]
      }
    ) {
      id
      points
    }
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
    const xHandle = body.xHandle ? String(body.xHandle).replace(/^@/, "").trim() : null;

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!isAddress(wallet)) {
      return NextResponse.json({ error: "Connect wallet first" }, { status: 400 });
    }

    const data = await nhostAdminRequest<{ insert_waitlist_one: { id: string } }>(UPSERT, {
      email,
      wallet,
      x_handle: xHandle,
      source: "opensea",
      collection: process.env.NEXT_PUBLIC_OPENSEA_SLUG ?? "pray-for-plagues",
    });

    return NextResponse.json({ ok: true, id: data.insert_waitlist_one?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Waitlist failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
