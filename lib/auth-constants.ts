// lib/auth-constants.ts
// Plain constants shared between lib/session.ts (server-only) and proxy.ts
// (which must NOT import "server-only" code). Keep this file dependency-free.
export const SESSION_COOKIE = "session_token";
export const BACKEND_REFRESH_COOKIE = "backend_refresh_token";
export const BACKEND_REFRESH_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Secure-refreshToken" : "refreshToken";

export const SESSION_MAX_AGE_SECONDS = 60 * 15;
export const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getBackendRefreshToken(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const escapedName = BACKEND_REFRESH_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = setCookieHeader.match(
    new RegExp(`(?:^|,\\s*)${escapedName}=([^;,\\s]+)`)
  );
  return match?.[1] ?? null;
}
