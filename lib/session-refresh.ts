import { API_BASE_URL } from "./api-config";
import {
  BACKEND_REFRESH_COOKIE_NAME,
  SESSION_REFRESH_MARGIN_MS,
  getBackendRefreshToken,
} from "./auth-constants";

export type SessionRefreshResult =
  | {
      kind: "refreshed";
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    }
  | { kind: "rejected" }
  | { kind: "unavailable" };

export function getAccessTokenExpiry(token: string): number | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload: unknown = JSON.parse(atob(paddedBase64));
    if (!isRecord(payload) || typeof payload.exp !== "number") return null;
    const expiresAt = payload.exp * 1000;
    return Number.isFinite(expiresAt) ? expiresAt : null;
  } catch {
    return null;
  }
}

export function isAccessTokenNearExpiry(token: string): boolean {
  const expiresAt = getAccessTokenExpiry(token);
  return (
    expiresAt === null ||
    expiresAt <= Date.now() + SESSION_REFRESH_MARGIN_MS
  );
}

export async function refreshBackendSession(
  refreshToken: string
): Promise<SessionRefreshResult> {
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
    return { kind: "unavailable" };
  }

  if (response.status === 401 || response.status === 403) {
    return { kind: "rejected" };
  }
  if (!response.ok) return { kind: "unavailable" };

  const json: unknown = await response.json().catch(() => null);
  if (!isRecord(json) || json.success !== true || !isRecord(json.data)) {
    return { kind: "unavailable" };
  }

  const accessToken = json.data.accessToken ?? json.data.token;
  const rotatedRefreshToken = getBackendRefreshToken(
    response.headers.get("set-cookie")
  );
  if (
    typeof accessToken !== "string" ||
    !accessToken ||
    !rotatedRefreshToken
  ) {
    return { kind: "unavailable" };
  }

  const expiresAt = getAccessTokenExpiry(accessToken);
  if (expiresAt === null) return { kind: "unavailable" };

  return {
    kind: "refreshed",
    accessToken,
    refreshToken: rotatedRefreshToken,
    expiresAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
