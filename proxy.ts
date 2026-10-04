// proxy.ts
// Next.js 16's request-interception file (formerly "middleware.ts").
// Uses optimistic cookie checks and refreshes near-expiry tokens, but does not
// call the user endpoint on every request or prefetch.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_RETURN_TO_HEADER,
  BACKEND_REFRESH_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-constants";
import { getSafeReturnToPath } from "@/lib/auth-redirect";
import {
  isAccessTokenNearExpiry,
  refreshBackendSession,
} from "@/lib/session-refresh";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/webhooks",
  "/shipments",
  "/events",
  "/deliveries",
  "/settings",
  "/demo-receiver",
];

const AUTH_ONLY_PREFIXES = ["/login", "/signup"];

function getRequestedPath(request: NextRequest): string {
  const target = new URL(request.nextUrl.pathname, request.nextUrl.origin);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "_rsc") target.searchParams.append(key, value);
  });
  return `${target.pathname}${target.search}`;
}

function continueRequest(request: NextRequest, isProtected: boolean) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(AUTH_RETURN_TO_HEADER);
  if (isProtected) {
    requestHeaders.set(AUTH_RETURN_TO_HEADER, getRequestedPath(request));
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function loginRedirect(request: NextRequest, returnTo: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    getSafeReturnToPath(returnTo) ?? "/dashboard"
  );
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(BACKEND_REFRESH_COOKIE);
  return response;
}

function clearSessionAndContinue(request: NextRequest) {
  const response = continueRequest(request, false);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(BACKEND_REFRESH_COOKIE);
  return response;
}

function setSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.set(BACKEND_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
  return response;
}

function sessionServiceUnavailable() {
  return NextResponse.json(
    { error: "Unable to refresh the session right now. Please try again." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const refreshToken = request.cookies.get(BACKEND_REFRESH_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const returnTo = getRequestedPath(request);
  const requestedNext = pathname === "/login"
    ? getSafeReturnToPath(request.nextUrl.searchParams.get("next"))
    : null;

  if ((isProtected || isAuthOnly) && !refreshToken) {
    if (isProtected) return loginRedirect(request, returnTo);
    return clearSessionAndContinue(request);
  }

  if (
    (isProtected || isAuthOnly) &&
    refreshToken &&
    (!sessionToken || isAccessTokenNearExpiry(sessionToken))
  ) {
    const refreshed = await refreshBackendSession(refreshToken);
    if (refreshed.kind === "rejected") {
      if (isProtected) return loginRedirect(request, returnTo);
      return clearSessionAndContinue(request);
    }
    if (refreshed.kind === "unavailable") {
      if (isProtected) return sessionServiceUnavailable();
      return continueRequest(request, false);
    }

    request.cookies.set(SESSION_COOKIE, refreshed.accessToken);
    request.cookies.set(BACKEND_REFRESH_COOKIE, refreshed.refreshToken);

    const response = isAuthOnly
      ? NextResponse.redirect(
          new URL(requestedNext ?? "/dashboard", request.url)
        )
      : continueRequest(request, true);
    return setSessionCookies(
      response,
      refreshed.accessToken,
      refreshed.refreshToken
    );
  }

  if (isAuthOnly && sessionToken) {
    if (requestedNext) return continueRequest(request, false);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return continueRequest(request, isProtected);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/webhooks/:path*",
    "/shipments/:path*",
    "/events/:path*",
    "/settings/:path*",
    "/demo-receiver/:path*",
    "/login",
    "/signup",
  ],
};
