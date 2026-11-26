import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { maskHandle } from "@/lib/mask";
import { loadBoard, loadTotals, rankOf } from "@/lib/board";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const x = (url.searchParams.get("x") || "").replace(/^@/, "").toLowerCase();

  // One response shape on every branch, so the UI never has to guess
  // whether `points` exists.
  const empty = { rows: [], rank: null as number | null, points: null as number | null, totalMembers: 0, totalPoints: 0 };

  if (!isNhostConfigured) {
    return NextResponse.json(empty);
  }

  try {
    const [all, totals] = await Promise.all([loadBoard(), loadTotals()]);
    const rank = rankOf(all, x);
    const rows = all.slice(0, 10).map((row, i) => ({
      rank: i + 1,
      xHandle: maskHandle(row.x_handle),
      points: row.points ?? 0,
      mine: rank === i + 1,
    }));

    return NextResponse.json({
      rows,
      rank,
      points: rank !== null ? (all[rank - 1].points ?? 0) : null,
      totalMembers: totals.totalMembers,
      totalPoints: totals.totalPoints,
    });
  } catch (err) {
    // A Hasura error used to 500 this whole read (no try/catch), so the
    // leaderboard showed "NO RANKS YET" even for ranked members.
    console.error("[rank] GET failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(empty);
  }
}

// POST is READ-ONLY: it returns the caller's current server-side points and
// rank. It NEVER accepts points from the client — any body.points is ignored.
// Points change only through server-side events (waitlist join, social
// credit, referral award). The old client-controlled `_set: { points }`
// sync is removed.
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
  try {
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
  } catch (err) {
    console.error("[rank] POST failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Rank lookup failed" }, { status: 500 });
  }
}
