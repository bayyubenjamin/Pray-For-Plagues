import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { SOCIAL_TASK_IDS } from "@/lib/social";

const SET = `
  mutation SetSocial($x: String!, $tasks: [String!]!) {
    update_waitlist(
      where: { x_handle: { _ilike: $x } }
      _set: { social_tasks: $tasks }
    ) {
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
  const tasks = Array.isArray(obj.tasks)
    ? obj.tasks.map(String).filter((t) => SOCIAL_TASK_IDS.includes(t as (typeof SOCIAL_TASK_IDS)[number]))
    : [];
  if (!xHandle) return NextResponse.json({ error: "Missing X" }, { status: 400 });
  try {
    await nhostAdminRequest(SET, { x: xHandle, tasks });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Add social_tasks column" }, { status: 200 });
  }
}
