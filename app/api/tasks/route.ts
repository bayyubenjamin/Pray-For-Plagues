import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { SOCIAL_ACTIONS } from "@/lib/social";
import { REFERRAL_POINTS } from "@/lib/referral";

const LIST = `
  query Tasks {
    tasks(where: { active: { _eq: true } }, order_by: { sort_order: asc }) {
      id
      label
      href
      points
      category
    }
  }
`;

// Server-side source of truth for completed social tasks. The client only
// reports which task buttons it opened; the referral check below reads the
// stored social_tasks from the DB — it never trusts a client-sent taskCount.
const GET_SOCIAL = `
  query WaitlistSocial($x: String!) {
    waitlist(where: { x_handle: { _ilike: $x } }, limit: 1) {
      x_handle
      social_tasks
    }
  }
`;

const MUTATION_VALIDATE_REF = `
  mutation ValidateReferral($referred: String!, $points_bonus: Int!) {
    update_referrals(
      where: { referred_handle: { _eq: $referred }, is_valid: { _eq: false } },
      _set: { is_valid: true, points_awarded: $points_bonus }
    ) {
      returning {
        referrer_handle
      }
    }
  }
`;

const MUTATION_ADD_POINTS = `
  mutation AddPoints($referrer: String!, $points: Int!) {
    update_waitlist(
      where: { x_handle: { _eq: $referrer } },
      _inc: { points: $points }
    ) {
      affected_rows
    }
  }
`;

type ValidateRefResponse = {
  update_referrals: { returning: { referrer_handle: string }[] };
};

export async function GET() {
  if (!isNhostConfigured) {
    return NextResponse.json({ tasks: SOCIAL_ACTIONS, source: "fallback" });
  }
  try {
    const data = await nhostAdminRequest<{ tasks: { id: string; label: string; href: string; points: number; category: string }[] }>(LIST, {});
    if (!data.tasks?.length) {
      return NextResponse.json({ tasks: SOCIAL_ACTIONS, source: "fallback" });
    }
    return NextResponse.json({ tasks: data.tasks, source: "nhost" });
  } catch {
    return NextResponse.json({ tasks: SOCIAL_ACTIONS, source: "fallback" });
  }
}

export async function POST(req: Request) {
  if (!isNhostConfigured) return NextResponse.json({ error: "Nhost not configured" }, { status: 503 });

  try {
    const body: unknown = await req.json().catch(() => ({}));
    const obj = (body ?? {}) as Record<string, unknown>;
    const handle = String(obj.xHandle ?? "").replace(/^@/, "").toLowerCase();

    if (!handle) return NextResponse.json({ error: "Missing X handle" }, { status: 400 });

    // Referral validation is driven by the DB, not by a client-sent count:
    // the referrer is only rewarded once the invitee has 4 stored social
    // tasks on their waitlist row.
    let socialCount = 0;
    try {
      const data = await nhostAdminRequest<{
        waitlist: { x_handle: string; social_tasks?: string[] | null }[];
      }>(GET_SOCIAL, { x: handle });
      socialCount = data.waitlist[0]?.social_tasks?.length ?? 0;
    } catch {
      socialCount = 0;
    }

    if (socialCount >= 4) {
      try {
        const refData = await nhostAdminRequest<ValidateRefResponse>(MUTATION_VALIDATE_REF, {
          referred: handle,
          points_bonus: REFERRAL_POINTS,
        });

        const referrer = refData?.update_referrals?.returning?.[0]?.referrer_handle;
        if (referrer) {
          await nhostAdminRequest(MUTATION_ADD_POINTS, {
            referrer,
            points: REFERRAL_POINTS,
          });
        }
      } catch {
        // Referrals table may not exist yet in some deployments; task
        // completion itself must not fail because of it.
      }
    }

    return NextResponse.json({ success: true, socialTasks: socialCount });
  } catch {
    return NextResponse.json({ error: "Failed to process task completion" }, { status: 500 });
  }
}
