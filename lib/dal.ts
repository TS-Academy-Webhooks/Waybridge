// lib/dal.ts
// Data Access Layer: the single place that reads the session cookie and
// turns it into either (a) an Authorization header for server-side fetches,
// or (b) the current user, or (c) a redirect for pages that require auth.
//
// Client Components can't import this (it's server-only). Server Components
// call verifySession()/getCurrentUser() and pass plain data down as props.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionToken } from "./session";
import { API_BASE_URL } from "./api-config";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operations" | "merchant" | "user";
};

// Optimistic-only note: this checks for the cookie's *presence*, matching
// what proxy.ts already did before the page rendered. It does NOT re-verify
// the JWT against the backend — that happens implicitly on the next backend
// fetch (an expired/invalid token just gets a 401 from Express).
export async function verifySession(): Promise<{ token: string }> {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }
  return { token };
}

export async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Cached per-request (React's cache()) so multiple components asking "who is
// the current user" during the same render don't each trigger a fresh
// GET /api/auth/me call.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return null;
    return json.data as SessionUser;
  } catch {
    return null;
  }
});
