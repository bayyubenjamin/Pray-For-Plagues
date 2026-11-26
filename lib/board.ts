import { nhostAdminRequest } from "./nhost-server";

/**
 * Single source of truth for the waitlist board. Both /api/rank and
 * /api/stats used to load it with different limits (200 vs 300), so a
 * member ranked 201-300 got `rank: null` from one endpoint and a real rank
 * from the other. Everyone now shares one load + one rank computation.
 *
 * BOARD_LIMIT covers the whole waitlist at this scale; totalMembers is
 * always the true count from the aggregate, so the UI can say "rank #N of
 * M" even if the board ever outgrows the limit.
 */
export const BOARD_LIMIT = 1000;

const BOARD_QUERY = `
  query Board {
    waitlist(order_by: [{ points: desc }, { created_at: asc }], limit: ${BOARD_LIMIT}) {
      x_handle
      wallet
      points
    }
  }
`;

const TOTALS_QUERY = `
  query BoardTotals {
    waitlist_aggregate {
      aggregate {
        count
        sum {
          points
        }
      }
    }
  }
`;

export type BoardRow = { x_handle: string; wallet: string; points: number };

export async function loadBoard(): Promise<BoardRow[]> {
  const data = await nhostAdminRequest<{ waitlist: BoardRow[] }>(BOARD_QUERY, {});
  return data.waitlist || [];
}

export async function loadTotals(): Promise<{ totalMembers: number; totalPoints: number }> {
  try {
    const data = await nhostAdminRequest<{
      waitlist_aggregate: { aggregate: { count: number; sum: { points: number | null } } };
    }>(TOTALS_QUERY, {});
    return {
      totalMembers: data.waitlist_aggregate?.aggregate?.count ?? 0,
      totalPoints: data.waitlist_aggregate?.aggregate?.sum?.points ?? 0,
    };
  } catch {
    return { totalMembers: 0, totalPoints: 0 };
  }
}

export function rankOf(board: BoardRow[], x: string): number | null {
  if (!x) return null;
  const i = board.findIndex((r) => r.x_handle.toLowerCase() === x.toLowerCase());
  return i >= 0 ? i + 1 : null;
}
