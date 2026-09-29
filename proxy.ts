// proxy.ts
// Next.js 16's request-interception file (formerly "middleware.ts").
// Does an OPTIMISTIC check only: cookie presence, no backend call — matches
// the "Optimistic checks with Proxy" pattern in
// node_modules/next/dist/docs/01-app/02-guides/authentication.md, since this
// runs on every request including prefetches and must stay fast.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-constants";

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in? Don't show login/signup again.
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isAuthOnly && hasSession) {
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
