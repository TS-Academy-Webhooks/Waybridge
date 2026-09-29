// lib/server-fetch.ts
// Shared authenticated fetch wrapper for all server-only data-layer modules
// (webhook-service, shipment-service, event-service, delivery-service).
// Attaches the Bearer token from the DAL, parses the backend's consistent
// { success, message, data } / { success:false, message, errors } envelope,
// and throws a typed error the caller (a Server Action or Server Component)
// can catch and turn into a field-level or toast-level message.
import "server-only";
import { API_BASE_URL } from "./api-config";
import { getAuthHeader } from "./dal";
import { parseApiError, type FieldErrors } from "./api-error";

export class ApiRequestError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type AuthFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function authFetch<T>(
  path: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  const authHeader = await getAuthHeader();
  const { body, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError("Unable to reach the server. Please try again.", 0);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const parsed = parseApiError(res.status, json);
    throw new ApiRequestError(parsed.message, parsed.status, parsed.fieldErrors);
  }

  return json.data as T;
}

// Builds a query string from a params object, skipping undefined/null/empty values.
export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
