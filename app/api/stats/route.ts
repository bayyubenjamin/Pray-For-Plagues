import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { loadBoard, loadTotals, rankOf } from "@/lib/board";
import { SOCIAL_TASK_IDS } from "@/lib/social";

const Q_ME_REFS = `
  query StatsMeRefs($x: String!) {
    me: waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      points
      social_tasks
      x_handle
      created_at
    }
    refs: waitlist(where: { referred_by: { _ilike: $x } }) {
      social_tasks
    }
  }
`;

const Q_ME_REFS_BASIC = `
  query StatsMeRefsBasic($x: String!) {
    me: waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      points
      x_handle
      created_at
    }
    refs: waitlist(where: { referred_by: { _ilike: $x } }) {
      x_handle
    }
  }
`;

type MeRow = { points?: number; social_tasks?: string[] | null; x_handle: string; created_at?: string };
type RefRow = { social_tasks?: string[] | null; x_handle?: string };

function socialCount(tasks: string[] | null | undefined): number {
  // Count only known social ids. Old rows can hold non-social ids (the
  // pre-whitelist join bug); without this filter a member could show
  // "6 OF 5 TASKS DONE".
  return (tasks || []).filter((t) => (SOCIAL_TASK_IDS as string[]).includes(t)).length;
}

export async function GET(req: Request) {
  const x = new URL(req.url).searchParams.get("x")?.replace(/^@/, "").toLowerCase() || "";
  const empty = {
    points: 0,
    rank: null as number | null,
    taskDone: 0,
    taskMax: 5,
    refValid: 0,
    refPending: 0,
    refTotal: 0,
    joined: false,
    joinedAt: null as string | null,
    totalMembers: 0,
    totalPoints: 0,
    degraded: false,
  };
  if (!isNhostConfigured || !x) return NextResponse.json(empty);

  try {
    const [board, totals, data] = await Promise.all([
      loadBoard(),
      loadTotals(),
      nhostAdminRequest<{ me: MeRow[]; refs: RefRow[] }>(Q_ME_REFS, { x }),
    ]);
    const me = data.me[0];
    const refs = data.refs || [];
    const social = socialCount(me?.social_tasks);
    const refValid = refs.filter((r) => socialCount(r.social_tasks) >= 4).length;
    return NextResponse.json({
      points: me?.points ?? 0,
      rank: rankOf(board, x),
      taskDone: Math.min((me ? 1 : 0) + social, 5),
      taskMax: 5,
      refValid,
      refPending: Math.max(0, refs.length - refValid),
      refTotal: refs.length,
      joined: Boolean(me),
      joinedAt: me?.created_at || null,
      totalMembers: totals.totalMembers,
      totalPoints: totals.totalPoints,
      degraded: false,
    });
  } catch {
    // Fallback when the social_tasks column is missing: do NOT count every
    // referral as valid (the old fallback did). Report refs as pending and
    // flag the response as degraded.
    try {
      const [board, totals, data] = await Promise.all([
        loadBoard(),
        loadTotals(),
        nhostAdminRequest<{ me: MeRow[]; refs: RefRow[] }>(Q_ME_REFS_BASIC, { x }),
      ]);
      const me = data.me[0];
      const refs = data.refs || [];
      return NextResponse.json({
        points: me?.points ?? 0,
        rank: rankOf(board, x),
        taskDone: me ? 1 : 0,
        taskMax: 5,
        refValid: 0,
        refPending: refs.length,
        refTotal: refs.length,
        joined: Boolean(me),
        joinedAt: me?.created_at || null,
        totalMembers: totals.totalMembers,
        totalPoints: totals.totalPoints,
        degraded: true,
      });
    } catch {
      return NextResponse.json(empty);
    }
  }
}
