import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { SOCIAL_TASK_IDS } from "@/lib/social";
import { socialPointsFor } from "@/lib/points";
import { REFERRAL_POINTS } from "@/lib/referral";
import { recordPointEvent } from "@/lib/point-events";
import { requireSession } from "@/lib/session";

const GET_ROW = `
  query SocialRow($x: String!) {
    waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      social_tasks
      referred_by
      referral_awarded
    }
  }
`;

const GET_ROW_LEGACY = `
  query SocialRowLegacy($x: String!) {
    waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      social_tasks
      referred_by
    }
  }
`;

const SET_SOCIAL_INC = `
  mutation SetSocialInc($x: String!, $tasks: [String!]!, $pts: Int!) {
    update_waitlist(
      where: { x_handle: { _ilike: $x } }
      _set: { social_tasks: $tasks }
      _inc: { points: $pts }
    ) {
      affected_rows
    }
  }
`;

const SET_AWARDED = `
  mutation SetAwarded($x: String!) {
    update_waitlist(where: { x_handle: { _ilike: $x } }, _set: { referral_awarded: true }) {
      affected_rows
    }
  }
`;

const AWARD_REF = `
  mutation AwardRef($x: String!, $pts: Int!) {
    update_waitlist(where: { x_handle: { _ilike: $x } }, _inc: { points: $pts }) {
      affected_rows
    }
  }
`;

const SYNC_PROFILE_POINTS = `
  mutation SyncProfilePoints($x: String!, $pts: Int!) {
    update_profiles(where: { x_handle: { _ilike: $x } }, _inc: { points: $pts }) {
      affected_rows
    }
  }
`;

// HONEST LIMITATION: social tasks are currently SELF-REPORTED. The client
// marks a task done after opening the link and waiting 10 seconds
// (SocialTasks.tsx) — X does not verify the follow/like/repost, and this
// endpoint only stores the claimed task ids (whitelisted to known ids).
// Do not treat social_tasks or the points derived from them as proof of a
// follow/like/repost. Verified social tasks need X API verification
// (followers/lookup + write scopes) and are intentionally not implemented yet.
export async function POST(req: Request) {
  if (!isNhostConfigured) return NextResponse.json({ ok: false }, { status: 503 });
  const body: unknown = await req.json().catch(() => ({}));
  const obj = (body ?? {}) as Record<string, unknown>;
  const xHandle = String(obj.xHandle ?? "").replace(/^@/, "").toLowerCase();
  const incoming = Array.isArray(obj.tasks)
    ? [...new Set(obj.tasks.map(String).filter((t) => (SOCIAL_TASK_IDS as string[]).includes(t)))]
    : [];
  if (!xHandle) return NextResponse.json({ error: "Missing X" }, { status: 400 });

  const denied = requireSession(req, xHandle);
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    // Load the stored row first: credit only the delta (new ids), so a
    // task can never pay twice — including tasks done before join (already
    // in the stored array) and repeated calls with the same list.
    let stored: string[] = [];
    let referredBy: string | null = null;
    let awardedKnown = true;
    let referralAwarded = false;
    try {
      const row = await nhostAdminRequest<{
        waitlist: { social_tasks?: string[] | null; referred_by?: string | null; referral_awarded?: boolean | null }[];
      }>(GET_ROW, { x: xHandle });
      stored = (row.waitlist[0]?.social_tasks || []).filter((t) => (SOCIAL_TASK_IDS as string[]).includes(t));
      referredBy = row.waitlist[0]?.referred_by || null;
      referralAwarded = Boolean(row.waitlist[0]?.referral_awarded);
    } catch {
      // referral_awarded column not migrated yet — fall back to the legacy
      // row shape and skip the referral award this call (no idempotency
      // guard without the column).
      awardedKnown = false;
      try {
        const row = await nhostAdminRequest<{
          waitlist: { social_tasks?: string[] | null; referred_by?: string | null }[];
        }>(GET_ROW_LEGACY, { x: xHandle });
        stored = (row.waitlist[0]?.social_tasks || []).filter((t) => (SOCIAL_TASK_IDS as string[]).includes(t));
        referredBy = row.waitlist[0]?.referred_by || null;
      } catch {
        stored = [];
      }
    }

    const merged = [...new Set([...stored, ...incoming])];
    const delta = merged.filter((t) => !stored.includes(t));
    const credit = socialPointsFor(delta);

    if (merged.length === stored.length && credit === 0) {
      return NextResponse.json({ ok: true, credited: 0 });
    }

    await nhostAdminRequest(SET_SOCIAL_INC, { x: xHandle, tasks: merged, pts: credit });
    if (credit > 0) {
      await recordPointEvent(xHandle, "SOCIAL", credit, { tasks: delta });
      try {
        await nhostAdminRequest(SYNC_PROFILE_POINTS, { x: xHandle, pts: credit });
      } catch {
        /* profiles mirror is best-effort */
      }
    }

    // Referral validation: the referrer earns +200 exactly once, the moment
    // the invitee reaches 4 social tasks. Paying at join rewarded
    // unverified invites; this is the single award moment now.
    let referralPaid = false;
    if (
      awardedKnown &&
      referredBy &&
      !referralAwarded &&
      stored.length < 4 &&
      merged.length >= 4
    ) {
      try {
        await nhostAdminRequest(AWARD_REF, { x: referredBy, pts: REFERRAL_POINTS });
        await nhostAdminRequest(SET_AWARDED, { x: xHandle });
        await recordPointEvent(referredBy, "REFERRAL", REFERRAL_POINTS, { referred: xHandle });
        try {
          await nhostAdminRequest(SYNC_PROFILE_POINTS, { x: referredBy, pts: REFERRAL_POINTS });
        } catch {
          /* profiles mirror is best-effort */
        }
        referralPaid = true;
      } catch {
        /* award must not fail the social update; it retries on next call */
      }
    }

    return NextResponse.json({ ok: true, credited: credit, referralPaid });
  } catch {
    return NextResponse.json({ ok: false, error: "Add social_tasks column" }, { status: 200 });
  }
}
