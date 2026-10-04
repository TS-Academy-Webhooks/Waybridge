import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BACKEND_REFRESH_COOKIE,
  SESSION_COOKIE,
  SESSION_REFRESH_MARGIN_MS,
} from "@/lib/auth-constants";
import { deleteSession, createSession } from "@/lib/session";
import {
  getAccessTokenExpiry,
  refreshBackendSession,
} from "@/lib/session-refresh";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Session refresh requests must be same-origin." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    await deleteSession();
    return refreshRejectedResponse();
  }

  const accessToken = cookieStore.get(SESSION_COOKIE)?.value;
  const currentExpiry = accessToken
    ? getAccessTokenExpiry(accessToken)
    : null;
  if (
    currentExpiry !== null &&
    currentExpiry > Date.now() + SESSION_REFRESH_MARGIN_MS
  ) {
    return refreshSuccessResponse(currentExpiry);
  }

  const result = await refreshBackendSession(refreshToken);
  if (result.kind === "rejected") {
    await deleteSession();
    return refreshRejectedResponse();
  }
  if (result.kind === "unavailable") {
    return NextResponse.json(
      { error: "Unable to refresh the session right now. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  await createSession(result.accessToken, result.refreshToken);
  return refreshSuccessResponse(result.expiresAt);
}

function refreshSuccessResponse(expiresAt: number) {
  return NextResponse.json(
    { expiresAt },
    { headers: { "Cache-Control": "no-store" } }
  );
}

function refreshRejectedResponse() {
  return NextResponse.json(
    { error: "Your session has expired. Please sign in again." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
