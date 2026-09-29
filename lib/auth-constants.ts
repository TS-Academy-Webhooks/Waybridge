// lib/auth-constants.ts
// Plain constants shared between lib/session.ts (server-only) and proxy.ts
// (which must NOT import "server-only" code). Keep this file dependency-free.
export const SESSION_COOKIE = "session_token";

// Matches the backend's JWT_EXPIRES_IN default of "7d"
// (see backend-my-part/src/utils/jwt.js). Kept in sync manually — if the
// backend's expiry changes, update this value too.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
