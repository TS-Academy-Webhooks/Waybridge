// lib/auth-constants.ts
// Plain constants shared between server session code, proxy.ts, and the
// active-session client component. Keep this file dependency-free.
export const SESSION_COOKIE = "session_token";
export const BACKEND_REFRESH_COOKIE = "backend_refresh_token";
export const BACKEND_REFRESH_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Secure-refreshToken" : "refreshToken";

export const SESSION_MAX_AGE_SECONDS = 60 * 15;
export const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_REFRESH_MARGIN_MS = 2 * 60 * 1000;
export const AUTH_RETURN_TO_HEADER = "x-chadman-return-to";

export function getBackendRefreshToken(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const escapedName = BACKEND_REFRESH_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = setCookieHeader.match(
    new RegExp(`(?:^|,\\s*)${escapedName}=([^;,\\s]+)`)
  );
  return match?.[1] ?? null;
}
