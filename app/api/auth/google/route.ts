import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    // Get the actual host from the request headers
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const requestUrl = host ? `${protocol}://${host}` : null;

   const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  requestUrl ||
  "http://localhost:3000"
).replace(/\/$/, ""); // ✅ removes trailing slash

    if (!GOOGLE_CLIENT_ID) {
      console.error("Missing GOOGLE_CLIENT_ID environment variable");
      return NextResponse.json(
        {
          success: false,
          message: "Google OAuth is not configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    const redirectUri = `${BASE_URL}/api/auth/callback`;
    const scope = [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", scope);
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");

    const state = Buffer.from(
      JSON.stringify({
        timestamp: Date.now(),
        provider: "google",
      })
    ).toString("base64");
    googleAuthUrl.searchParams.set("state", state);

    return NextResponse.json({
      success: true,
      redirectUrl: googleAuthUrl.toString(),
    });
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initiate Google sign-in. Please try again.",
      },
      { status: 500 }
    );
  }
}
