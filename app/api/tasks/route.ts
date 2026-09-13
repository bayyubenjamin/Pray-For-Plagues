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
