import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://prayforplagues.xyz";

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

  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers,
    body,
  });
  const token = await tokenRes.json();
  if (!token.access_token) {
    return NextResponse.redirect(`${APP_URL}/task?x=token_error`);
  }

  const meRes = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const me = await meRes.json();
  const handle = me?.data?.username;
  if (!handle) {
    return NextResponse.redirect(`${APP_URL}/task?x=user_error`);
  }

  const dest = NextResponse.redirect(`${APP_URL}/task?x=connected&handle=${encodeURIComponent(handle)}`);
  dest.cookies.delete("x_verifier");
  dest.cookies.delete("x_state");
  return dest;
}
