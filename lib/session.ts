
import { cookies, headers } from "next/headers";
import { AuthService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function parseAccessTokenFromCookieHeader(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const [k, v] = c.split("=");
    if (k === "accessToken") return decodeURIComponent(v || "");
  }
  return null;
}

export interface SessionUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "RECRUITER";
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    let token = cookieStore.get("accessToken")?.value;

    if (!token) {
      const authHeader = headers().get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const payload = AuthService.verifyToken(token);
    if (!payload || payload.type !== "access") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        uid: true,
        email: true,
        name: true,
        role: true,
        displayName: true,
        firstName: true,
        lastName: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getCurrentUserFromRequest(
  request: Request | NextRequest
): Promise<SessionUser | null> {
  try {
    const authHeader = (request as any).headers?.get
      ? (request as any).headers.get("authorization")
      : null;
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Try cookie header if no Authorization
    if (!token) {
      const cookieHeader = (request as any).headers?.get
        ? (request as any).headers.get("cookie")
        : null;
      token = parseAccessTokenFromCookieHeader(cookieHeader);
    }

    if (!token) {
      return null;
    }

    const payload = AuthService.verifyToken(token);
    if (!payload || payload.type !== "access") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        uid: true,
        email: true,
        name: true,
        role: true,
        displayName: true,
        firstName: true,
        lastName: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user from request:", error);
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(
  role: "CANDIDATE" | "RECRUITER"
): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return user;
}
