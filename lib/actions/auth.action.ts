"use server";

import { cookies } from "next/headers";
import { AuthService } from "@/lib/auth";

const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getSessionServer() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return null;
  }

  const session = AuthService.verifyToken(sessionCookie.value);
  if (!session) {
    return null;
  }

  const user = await AuthService.findUserByUid(session.userId);
  return user;
}

export async function signOutServer() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
