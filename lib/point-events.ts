import { nhostAdminRequest } from "./nhost-server";

/**
 * Point ledger — every server-side point change writes one row here so a
 * member's balance can be audited and shown as a history. Before this
 * ledger existed, balances could not be reconciled from the DB (e.g. a
 * 600-point balance with no record of where the points came from).
 *
 * All helpers are best-effort: if the table has not been migrated/tracked
 * yet, they fail silently so the main request (join, social, award) never
 * breaks because of the ledger.
 */
export type PointEvent = {
  id?: string;
  x_handle: string;
  event: string;
  points: number;
  meta?: Record<string, unknown> | null;
  created_at?: string;
};

const INSERT_EVENT = `
  mutation InsertPointEvent($x_handle: String!, $event: String!, $points: Int!, $meta: jsonb) {
    insert_point_events_one(object: { x_handle: $x_handle, event: $event, points: $points, meta: $meta }) {
      id
    }
  }
`;

const LIST_EVENTS = `
  query ListPointEvents($x: String!, $limit: Int!) {
    point_events(where: { x_handle: { _ilike: $x } }, order_by: { created_at: desc }, limit: $limit) {
      id
      event
      points
      meta
      created_at
    }
  }
`;

export async function recordPointEvent(
  xHandle: string,
  event: string,
  points: number,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await nhostAdminRequest(INSERT_EVENT, {
      x_handle: xHandle.toLowerCase(),
      event,
      points,
      meta: meta ?? null,
    });
  } catch {
    /* ledger table not migrated/tracked yet — main flow must not fail */
  }
}

export async function listPointEvents(xHandle: string, limit = 50): Promise<PointEvent[]> {
  try {
    const data = await nhostAdminRequest<{ point_events: PointEvent[] }>(LIST_EVENTS, {
      x: xHandle.toLowerCase(),
      limit,
    });
    return data.point_events || [];
  } catch {
    return [];
  }
}
