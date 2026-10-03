// features/tracking/tracking-service.ts
// Server-only, but deliberately NOT gated by the DAL — this is the one data
// module that must work with no session, mirroring the backend's public
// GET /api/tracking/:trackingNumber (no `protect` middleware in
// waybridge-be/src/routes/trackingRoutes.js).
import "server-only";
import { API_BASE_URL } from "@/lib/api-config";
import { parseApiError } from "@/lib/api-error";
import { ApiRequestError } from "@/lib/server-fetch";

export type TimelineEntry = {
  status: string;
  at: string;
  timestamp?: string;
  note?: string | null;
};

export type TrackedShipment = {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  lastUpdated: string;
  lastUpdate: string;
  timeline: TimelineEntry[];
};

// Mirrors the backend's exact validation: TRK-##### (5 digits).
export const TRACKING_NUMBER_PATTERN = /^TRK-\d{5}$/;

export async function trackShipment(trackingNumber: string): Promise<TrackedShipment> {
  const normalized = trackingNumber.trim().toUpperCase();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/tracking/${encodeURIComponent(normalized)}`, {
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

  const data = json.data as Omit<TrackedShipment, "lastUpdated" | "lastUpdate"> & {
    lastUpdated?: string;
    lastUpdate?: string;
  };
  const lastUpdated = data.lastUpdated ?? data.lastUpdate ?? "";
  return { ...data, lastUpdated, lastUpdate: lastUpdated };
}
