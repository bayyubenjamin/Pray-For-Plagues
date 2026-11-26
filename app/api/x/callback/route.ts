import { NextRequest, NextResponse } from "next/server";
import { nhostAdminRequest } from "@/lib/nhost-server";
import { signSession, sessionCookieHeader } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://prayforplagues.xyz";

const SET_X_USER_ID = `
  mutation SetXUserId($x: String!, $id: String!) {
    update_waitlist(where: { x_handle: { _ilike: $x } }, _set: { x_user_id: $id }) {
      affected_rows
    }
  }
`;

export async function GET(req: NextRequest) {
  const redirectUri = process.env.X_REDIRECT_URI || `${APP_URL}/api/x/callback`;
  const clientId = process.env.X_CLIENT_ID || "";
  const clientSecret = process.env.X_CLIENT_SECRET || "";

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("x_state")?.value;
  const verifier = req.cookies.get("x_verifier")?.value;

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    return NextResponse.redirect(`${APP_URL}/task?x=denied`);
  }

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  let token: { access_token?: string } = {};
  try {
    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers,
      body,
    });
    token = (await tokenRes.json().catch(() => ({}))) as typeof token;
  } catch {
    return NextResponse.redirect(`${APP_URL}/task?x=token_error`);
  }
  if (!token.access_token) {
    return NextResponse.redirect(`${APP_URL}/task?x=token_error`);
  }

  let me: { data?: { id?: string; username?: string } } = {};
  try {
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    me = (await meRes.json().catch(() => ({}))) as typeof me;
  } catch {
    return NextResponse.redirect(`${APP_URL}/task?x=user_error`);
  }
  const handle = me?.data?.username;
  const xUserId = me?.data?.id || "";
  if (!handle) {
    return NextResponse.redirect(`${APP_URL}/task?x=user_error`);
  }

  // Server-side proof of this X account, from now on:
  // 1. Store the X user id on the waitlist row (the column existed but was
  //    never written by anyone, so identity was purely self-asserted).
  // 2. Issue a signed session cookie the write routes require.
  if (xUserId) {
    try {
      await nhostAdminRequest(SET_X_USER_ID, { x: handle.toLowerCase(), id: xUserId });
    } catch {
      /* user may not have joined yet — the join writes it later if needed */
    }
  }

  const dest = NextResponse.redirect(`${APP_URL}/task?x=connected&handle=${encodeURIComponent(handle)}`);
  const session = signSession(handle, xUserId);
  if (session) dest.headers.append("Set-Cookie", sessionCookieHeader(session));
  dest.cookies.delete("x_verifier");
  dest.cookies.delete("x_state");
  return dest;
}
