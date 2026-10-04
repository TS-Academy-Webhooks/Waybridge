// lib/dal.ts
// Data Access Layer: the single place that reads the session cookie and
// turns it into either (a) an Authorization header for server-side fetches,
// or (b) the current user, or (c) a redirect for pages that require auth.
//
// Client Components can't import this (it's server-only). Server Components
// call verifySession()/getCurrentUser() and pass plain data down as props.
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionToken } from "./session";
import { API_BASE_URL } from "./api-config";
import { AUTH_RETURN_TO_HEADER } from "./auth-constants";
import { getSafeReturnToPath } from "./auth-redirect";
import { getAccessTokenExpiry } from "./session-refresh";

export type SessionUser = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

export async function verifySession(): Promise<{
  user: SessionUser;
  expiresAt: number | null;
}> {
  const token = await getSessionToken();
  if (!token) return redirectToLogin();

  const user = await getCurrentUser();
  if (!user) return redirectToLogin();

  return { user, expiresAt: getAccessTokenExpiry(token) };
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

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Unable to verify the session (HTTP ${res.status}).`);
  }
  if (!isRecord(json) || json.success !== true) {
    throw new Error("The server returned an invalid session response.");
  }

  const data = json.data;
  const user = isRecord(data) && "user" in data ? data.user : data;
  if (
    !isRecord(user) ||
    typeof user.id !== "string" ||
    typeof user.name !== "string" ||
    typeof user.email !== "string" ||
    (user.role !== "admin" && user.role !== "customer")
  ) {
    throw new Error("The server returned invalid user data for the session.");
  }

  return {
    id: user.id,
    ...(typeof user._id === "string" ? { _id: user._id } : {}),
    name: user.name,
    email: user.email,
    role: user.role,
  };
});

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) return redirectToLogin();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

async function redirectToLogin(): Promise<never> {
  const returnTo =
    getSafeReturnToPath((await headers()).get(AUTH_RETURN_TO_HEADER)) ??
    "/dashboard";
  redirect(`/login?next=${encodeURIComponent(returnTo)}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
