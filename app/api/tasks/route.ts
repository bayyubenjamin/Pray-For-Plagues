import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { SOCIAL_ACTIONS } from "@/lib/social";

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
    const { xHandle, taskCount } = await req.json();
    const handle = String(xHandle ?? "").replace(/^@/, "").toLowerCase();
    
    if (!handle) return NextResponse.json({ error: "Missing X handle" }, { status: 400 });

    // Validasi Referral: Jika user sudah menyelesaikan 4 task, aktifkan status referral pengundangnya
    if (taskCount >= 4) {
      const refData = await nhostAdminRequest<any>(MUTATION_VALIDATE_REF, {
        referred: handle,
        points_bonus: 100 // Sesuaikan bonus poin referral
      });

      const referrer = refData?.update_referrals?.returning?.[0]?.referrer_handle;
      if (referrer) {
         await nhostAdminRequest(MUTATION_ADD_POINTS, {
           referrer: referrer,
           points: 100
         });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process task completion" }, { status: 500 });
  }
}
