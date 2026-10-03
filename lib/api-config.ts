// lib/api-config.ts
// Base URL for the Express/MongoDB backend in ../davinci/src/app.js.
// Server-side only — never expose this as NEXT_PUBLIC_*, all requests to the
// backend happen from Server Components / Server Actions.
export const API_BASE_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:5000/api";

// Convenience endpoint used by the demo receiver page and webhook setup flow.
export const DEMO_RECEIVER_URL = `${API_BASE_URL}/demo-receiver`;
