import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { maskHandle } from "@/lib/mask";

const LIST = `
  query RankList {
    waitlist(order_by: [{ points: desc }, { created_at: asc }], limit: 200) {
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
  const all = data.waitlist || [];
  const mineIndex = x ? all.findIndex((r) => r.x_handle.toLowerCase() === x) : -1;

  const rows = all.slice(0, 10).map((row, i) => ({
    rank: i + 1,
    xHandle: maskHandle(row.x_handle),
    points: row.points ?? 0,
    mine: mineIndex === i,
  }));

  return NextResponse.json({
    rows,
    rank: mineIndex >= 0 ? mineIndex + 1 : null,
    points: mineIndex >= 0 ? all[mineIndex].points ?? 0 : null,
  });
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
