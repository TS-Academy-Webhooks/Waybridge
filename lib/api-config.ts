// lib/api-config.ts
// Base URL for the Express/MongoDB backend (see backend-my-part/src/app.js).
// Server-side only — never expose this as NEXT_PUBLIC_*, all requests to the
// backend happen from Server Components / Server Actions.
export const API_BASE_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:5000/api";

// Convenience endpoint mirrored from the old frontend's "Use Demo Receiver"
// button. Note: backend-my-part's README explicitly calls this out as an
// optional extra it did NOT implement in this drop — the URL is provided so
// the UI parity exists, but requests to it will 404 until the backend adds
// demo-receiver.controller.js / demo-receiver.routes.js.
export const DEMO_RECEIVER_URL = `${API_BASE_URL}/demo-receiver`;
