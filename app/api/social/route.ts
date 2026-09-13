import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost";
import { nhostAdminRequest } from "@/lib/nhost-server";

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

export async function POST(req: Request) {
  if (!isNhostConfigured) return NextResponse.json({ ok: false }, { status: 503 });
  const body = await req.json();
  const xHandle = String(body.xHandle ?? "").replace(/^@/, "").toLowerCase();
  const tasks = Array.isArray(body.tasks) ? body.tasks.map(String) : [];
  if (!xHandle) return NextResponse.json({ error: "Missing X" }, { status: 400 });
  try {
    await nhostAdminRequest(SET, { x: xHandle, tasks });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Add social_tasks column" }, { status: 200 });
  }
}
