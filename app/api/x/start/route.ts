import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://prayforplagues.xyz";

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI || `${APP_URL}/api/x/callback`;

  if (!clientId) {
    return NextResponse.redirect(`${APP_URL}/profile?x=missing_app`);
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
