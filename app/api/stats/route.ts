import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";

const Q_FULL = `
  query Stats($x: String!) {
    me: waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      points
      social_tasks
      x_handle
    }
    board: waitlist(order_by: [{ points: desc }, { created_at: asc }], limit: 300) {
      x_handle
      points
    }
    refs: waitlist(where: { referred_by: { _ilike: $x } }) {
      social_tasks
    }
  }
`;

const Q_BASIC = `
  query StatsBasic($x: String!) {
    me: waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      points
      x_handle
    }
    board: waitlist(order_by: [{ points: desc }, { created_at: asc }], limit: 300) {
      x_handle
      points
    }
    refs: waitlist(where: { referred_by: { _ilike: $x } }) {
      x_handle
    }
  }
`;

export async function GET(req: Request) {
  const x = new URL(req.url).searchParams.get("x")?.replace(/^@/, "").toLowerCase() || "";
  const empty = {
    points: 0,
    rank: null as number | null,
    taskDone: 0,
    taskMax: 5,
    refValid: 0,
    refPending: 0,
    joined: false,
  };
  if (!isNhostConfigured || !x) return NextResponse.json(empty);

  const pack = (
    me: { points?: number; social_tasks?: string[] | null; x_handle: string } | undefined,
    board: { x_handle: string; points: number }[],
    refs: { social_tasks?: string[] | null }[]
  ) => {
    const social = me?.social_tasks || [];
    const rankIndex = board.findIndex((r) => r.x_handle.toLowerCase() === x);
    const refValid = refs.filter((r) => (r.social_tasks || []).length >= 4).length;
    const refPending = Math.max(0, refs.length - refValid);
    return {
      points: me?.points ?? 0,
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      taskDone: (me ? 1 : 0) + social.length,
      taskMax: 5,
      joined: Boolean(me),
      refValid: refs[0] && refs[0].social_tasks === undefined ? refs.length : refValid,
      refPending: refs[0] && refs[0].social_tasks === undefined ? 0 : refPending,
      refTotal: refs.length,
    };
  };

  try {
    const data = await nhostAdminRequest<{
      me: { points: number; social_tasks?: string[] | null; x_handle: string }[];
      board: { x_handle: string; points: number }[];
      refs: { social_tasks?: string[] | null }[];
    }>(Q_FULL, { x });
    return NextResponse.json(pack(data.me[0], data.board || [], data.refs || []));
  } catch {
    try {
      const data = await nhostAdminRequest<{
        me: { points: number; x_handle: string }[];
        board: { x_handle: string; points: number }[];
        refs: { x_handle: string }[];
      }>(Q_BASIC, { x });
      // Error TS2345 diselesaikan dengan as any pada pemanggilan pack block fallback ini
      return NextResponse.json(pack(data.me[0] as any, data.board || [], data.refs as any));
    } catch {
      return NextResponse.json(empty);
    }
  }
}
