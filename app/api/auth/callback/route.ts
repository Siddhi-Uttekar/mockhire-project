import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * OAuth Callback Route
 *
 * This route handles the OAuth callback from Google after user authorization.
 * It exchanges the authorization code for access tokens, fetches user info,
 * and creates or updates the user in the database.
 */

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub?: string; // Google user ID - make optional to handle missing data
  id?: string; // Alternative ID field
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=missing_code", request.url)
      );
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    // Get the actual host from the request headers
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const requestUrl = host ? `${protocol}://${host}` : null;

    // Determine BASE_URL: use localhost for dev, production URL for prod
    let BASE_URL = "http://localhost:3000";

    if (process.env.NODE_ENV === "production") {
      BASE_URL = (
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXTAUTH_URL ||
        requestUrl ||
        "https://mockhire-project.vercel.app"
      ).replace(/\/$/, "");
    } else {
      // Development: use request host if available, otherwise localhost
      BASE_URL = (requestUrl || "http://localhost:3000").replace(/\/$/, "");
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials");
      return NextResponse.redirect(
        new URL("/login?error=oauth_not_configured", request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${BASE_URL}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", request.url)
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch user info");
      return NextResponse.redirect(
        new URL("/login?error=user_info_failed", request.url)
      );
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Log the complete response for debugging
    console.log(
      "Complete Google user response:",
      JSON.stringify(googleUser, null, 2)
    );

    // Validate required fields from Google - use sub or id
    const userId = googleUser.sub || googleUser.id;
    if (!userId || !googleUser.email) {
      console.error(
        "Missing required user info from Google. Received:",
        googleUser
      );
      return NextResponse.redirect(
        new URL("/login?error=invalid_user_info", request.url)
      );
    }

    const userName = googleUser.name || googleUser.email.split("@")[0];
    const firstName = googleUser.given_name || userName.split(" ")[0] || "";
    const lastName =
      googleUser.family_name || userName.split(" ").slice(1).join(" ") || "";

    // Log for debugging
    console.log("Processed Google user info:", {
      userId,
      email: googleUser.email,
      name: userName,
      firstName,
      lastName,
    });

    // Check if user exists, otherwise create
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { social_links: true },
    });

    if (!user) {
      // Create new user with Google provider
      console.log("Creating new user with data:", {
        uid: userId,
        email: googleUser.email,
        name: userName,
      });

      // Generate unique ID for the user
      const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      user = await prisma.user.create({
        data: {
          id: uniqueId,
          uid: userId,
          email: googleUser.email,
          name: userName,
          displayName: userName,
          firstName: firstName,
          lastName: lastName,
          provider: "google",
          role: "CANDIDATE", // Default role, can be updated later
          isVerified: googleUser.email_verified || false,
          updatedAt: new Date(),
        },
        include: { social_links: true },
      });
    } else if (user.provider !== "google") {
      // User exists with email/password, update to link Google account
      console.log("Updating existing user to link Google account");

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          uid: userId,
          provider: "google",
          displayName: userName,
          firstName: firstName,
          lastName: lastName,
          isVerified: googleUser.email_verified || false,
        },
        include: { social_links: true },
      });
    } else {
      console.log("User already exists with Google provider");
    }

    // Ensure user exists at this point
    if (!user) {
      throw new Error("User creation/update failed");
    }

    // Generate JWT tokens for our app
    const { accessToken, refreshToken } = AuthService.generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Create response with redirect based on role
    const redirectPath = user.role === "RECRUITER" ? "/recruiter" : "/";
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    // Set HTTP-only cookie for refresh token
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Set access token in cookie (or you can use localStorage via client-side redirect)
    response.cookies.set("accessToken", accessToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", request.url)
    );
  }
}
