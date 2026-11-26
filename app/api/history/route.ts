import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { listPointEvents, type PointEvent } from "@/lib/point-events";
import { requireSession } from "@/lib/session";
import { WAITLIST_POINTS } from "@/lib/points";

const GET_ME = `
  query HistoryMe($x: String!) {
    waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      points
      created_at
    }
  }
`;

/**
 * Points history for one member, newest first.
 * Events come from the point_events ledger (written by join / social /
 * referral-award). Members who joined before the ledger existed get their
 * JOIN event synthesized from the waitlist row, and any balance that no
 * event explains is reported as `earlierPoints` so the total always
 * reconciles instead of silently not adding up.
 */
export async function GET(req: Request) {
  const x = new URL(req.url).searchParams.get("x")?.replace(/^@/, "").toLowerCase() || "";
  if (!isNhostConfigured || !x) return NextResponse.json({ events: [], total: 0, earlierPoints: 0 });

  const denied = requireSession(req, x);
  if (denied) return NextResponse.json({ error: denied.error, sessionRequired: true }, { status: denied.status });

  try {
    const [meData, events] = await Promise.all([
      nhostAdminRequest<{ waitlist: { points?: number; created_at?: string }[] }>(GET_ME, { x }),
      listPointEvents(x, 50),
    ]);
    const me = meData.waitlist[0];
    const total = me?.points ?? 0;

    const list: PointEvent[] = [...events];
    if (me && !list.some((e) => e.event === "JOIN")) {
      list.push({
        x_handle: x,
        event: "JOIN",
        points: WAITLIST_POINTS,
        created_at: me.created_at,
      });
    }
    list.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });

    const itemized = list.reduce((sum, e) => sum + (e.points || 0), 0);
    const earlierPoints = Math.max(0, total - itemized);

    return NextResponse.json({ events: list, total, earlierPoints });
  } catch (err) {
    console.error("[history] GET failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ events: [], total: 0, earlierPoints: 0 });
  }
}
