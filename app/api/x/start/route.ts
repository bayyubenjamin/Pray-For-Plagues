import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://prayforplagues.vercel.app";
  const redirectUri = process.env.X_REDIRECT_URI || `${appUrl}/api/x/callback`;

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/profile?x=missing_app`);
  }

  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  const state = b64url(randomBytes(16));

  const url = new URL("https://x.com/i/oauth2/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "tweet.read users.read offline.access");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("x_verifier", verifier, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  res.cookies.set("x_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
