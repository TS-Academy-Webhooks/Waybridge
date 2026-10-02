// lib/session.ts
// Server-side session management: stores the backend JWT in an httpOnly
// cookie, per Next.js's stateless-session pattern
// (see node_modules/next/dist/docs/01-app/02-guides/authentication.md).
import "server-only";
import { cookies } from "next/headers";
import {
  BACKEND_REFRESH_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "./auth-constants";

export async function createSession(token: string, refreshToken: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };
  cookieStore.set(SESSION_COOKIE, token, {
    ...options,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  cookieStore.set(BACKEND_REFRESH_COOKIE, refreshToken, {
    ...options,
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(BACKEND_REFRESH_COOKIE);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function getBackendRefreshTokenValue(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(BACKEND_REFRESH_COOKIE)?.value;
}
