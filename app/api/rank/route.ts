import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";

const LIST = `
  query RankList {
    waitlist(order_by: [{ points: desc }, { created_at: asc }], limit: 100) {
      x_handle
      wallet
      points
    }
  }
`;

const SYNC = `
  mutation SyncPoints($x: String!, $wallet: String, $points: Int!) {
    update_waitlist(
      where: {
        _or: [
          { x_handle: { _ilike: $x } },
          { wallet: { _ilike: $wallet } }
        ]
      },
      _set: { points: $points }
    ) {
      affected_rows
    }
  }
`;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const x = (url.searchParams.get("x") || "").replace(/^@/, "").toLowerCase();

  if (!isNhostConfigured) {
    return NextResponse.json({ rows: [], rank: null });
  }

  const data = await nhostAdminRequest<{ waitlist: { x_handle: string; wallet: string; points: number }[] }>(LIST, {});
  const rows = (data.waitlist || []).map((row, i) => ({
    rank: i + 1,
    xHandle: row.x_handle,
    wallet: row.wallet,
    points: row.points ?? 0,
  }));
  const mine = x ? rows.find((r) => r.xHandle.toLowerCase() === x) : null;
  return NextResponse.json({ rows, rank: mine?.rank ?? null, points: mine?.points ?? null });
}

export async function POST(req: Request) {
  if (!isNhostConfigured) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const body = await req.json();
  const x = String(body.xHandle ?? "").replace(/^@/, "").trim().toLowerCase();
  const wallet = String(body.wallet ?? "").trim().toLowerCase();
  const points = Number(body.points ?? 0);
  if (!x && !wallet) {
    return NextResponse.json({ error: "Missing identity" }, { status: 400 });
  }
  await nhostAdminRequest(SYNC, { x: x || "__none__", wallet: wallet || "__none__", points });
  return NextResponse.json({ ok: true });
}
