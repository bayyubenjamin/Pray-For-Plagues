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

type RankRow = { x_handle: string; wallet: string; points: number };

async function loadBoard(): Promise<RankRow[]> {
  const data = await nhostAdminRequest<{ waitlist: RankRow[] }>(LIST, {});
  return data.waitlist || [];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const x = (url.searchParams.get("x") || "").replace(/^@/, "").toLowerCase();

  if (!isNhostConfigured) {
    return NextResponse.json({ rows: [], rank: null });
  }

  const all = await loadBoard();
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

// POST is READ-ONLY: it returns the caller's current server-side points and
// rank. It NEVER accepts points from the client — any body.points is ignored.
// Points change only through server-side events (waitlist join, referral
// award). The old client-controlled `_set: { points }` sync is removed.
export async function POST(req: Request) {
  if (!isNhostConfigured) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const body: unknown = await req.json().catch(() => ({}));
  const obj = (body ?? {}) as Record<string, unknown>;
  const x = String(obj.xHandle ?? "").replace(/^@/, "").trim().toLowerCase();
  const wallet = String(obj.wallet ?? "").trim().toLowerCase();
  if (!x && !wallet) {
    return NextResponse.json({ error: "Missing identity" }, { status: 400 });
  }
  const all = await loadBoard();
  const mineIndex = all.findIndex(
    (r) =>
      (x && r.x_handle.toLowerCase() === x) ||
      (wallet && r.wallet.toLowerCase() === wallet),
  );
  if (mineIndex < 0) {
    return NextResponse.json({ ok: false, points: 0, rank: null }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    points: all[mineIndex].points ?? 0,
    rank: mineIndex + 1,
  });
}
