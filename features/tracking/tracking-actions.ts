// features/tracking/tracking-actions.ts
"use server";

import { ApiRequestError } from "@/lib/server-fetch";
import {
  trackShipment,
  TRACKING_NUMBER_PATTERN,
  type TrackedShipment,
} from "./tracking-service";

export type TrackResult =
  | { status: "success"; shipment: TrackedShipment }
  | { status: "not_found" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export async function trackShipmentFormAction(formData: FormData): Promise<TrackResult> {
  const trackingNumber = (formData.get("trackingNumber")?.toString() ?? "")
    .trim()
    .toUpperCase();

  if (!TRACKING_NUMBER_PATTERN.test(trackingNumber)) {
    return {
      status: "invalid",
      message: "Tracking numbers look like TRK-00001.",
    };
  }

  try {
    const shipment = await trackShipment(trackingNumber);
    return { status: "success", shipment };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 404) return { status: "not_found" };
      if (error.status === 400) {
        return { status: "invalid", message: error.message };
      }
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}
