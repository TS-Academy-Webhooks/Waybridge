// proxy.ts
// Next.js 16's request-interception file (formerly "middleware.ts").
// Does an OPTIMISTIC check only: cookie presence, no backend call — matches
// the "Optimistic checks with Proxy" pattern in
// node_modules/next/dist/docs/01-app/02-guides/authentication.md, since this
// runs on every request including prefetches and must stay fast.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api-config";
import {
  BACKEND_REFRESH_COOKIE,
  BACKEND_REFRESH_COOKIE_NAME,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-constants";

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

type RefreshResponse = {
  success?: boolean;
  data?: { accessToken?: unknown; token?: unknown };
};

function isAccessTokenNearExpiry(token: string): boolean {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return true;
    const payload = JSON.parse(
      atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: unknown };
    return typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000 + 120;
  } catch {
    return true;
  }
}

function loginRedirect(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(BACKEND_REFRESH_COOKIE);
  return response;
}

async function refreshSession(request: NextRequest) {
  const refreshToken = request.cookies.get(BACKEND_REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `${BACKEND_REFRESH_COOKIE_NAME}=${refreshToken}`,
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;
  const json = (await response.json().catch(() => null)) as RefreshResponse | null;
  const accessToken = json?.data?.accessToken ?? json?.data?.token;
  const rotatedRefreshToken = response.headers.get("set-cookie");
  const refreshMatch = rotatedRefreshToken?.match(
    new RegExp(`(?:^|,\\s*)${BACKEND_REFRESH_COOKIE_NAME}=([^;,\\s]+)`)
  );
  if (!json?.success || typeof accessToken !== "string" || !refreshMatch?.[1]) {
    return null;
  }

  return { accessToken, refreshToken: refreshMatch[1] };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const hasRefreshToken = Boolean(request.cookies.get(BACKEND_REFRESH_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if ((isProtected || isAuthOnly) && (!sessionToken || !hasRefreshToken)) {
    if (isProtected) return loginRedirect(request, pathname);
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(BACKEND_REFRESH_COOKIE);
    return response;
  }

  if ((isProtected || isAuthOnly) && sessionToken && isAccessTokenNearExpiry(sessionToken)) {
    const refreshed = await refreshSession(request);
    if (!refreshed) {
      if (isProtected) return loginRedirect(request, pathname);
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE);
      response.cookies.delete(BACKEND_REFRESH_COOKIE);
      return response;
    }

    sessionToken = refreshed.accessToken;
    request.cookies.set(SESSION_COOKIE, refreshed.accessToken);
    request.cookies.set(BACKEND_REFRESH_COOKIE, refreshed.refreshToken);
    const response = NextResponse.next({ request });
    response.cookies.set(SESSION_COOKIE, refreshed.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    response.cookies.set(BACKEND_REFRESH_COOKIE, refreshed.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: REFRESH_MAX_AGE_SECONDS,
    });
    if (isAuthOnly) return NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  if (isProtected && !sessionToken) {
    return loginRedirect(request, pathname);
  }

  if (isAuthOnly && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
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
