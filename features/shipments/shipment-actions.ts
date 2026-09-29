// features/shipments/shipment-actions.ts
"use server";

import { refresh } from "next/cache";
import { ApiRequestError } from "@/lib/server-fetch";
import {
  createShipment,
  updateShipmentStatus,
  type CreateShipmentInput,
} from "@/lib/shipment-service";
import { shipmentFormSchema, type ShipmentFormValues } from "@/lib/validate-shipment";
import { isValidTransition, type ShipmentStatus } from "@/constants/shipment-status";
import type { FieldErrors } from "@/lib/api-error";

export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; message: string; fieldErrors?: FieldErrors };

export async function createShipmentAction(
  values: ShipmentFormValues
): Promise<ActionResult<{ id: string; trackingNumber: string }>> {
  const parsed = shipmentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const input: CreateShipmentInput = parsed.data;
    const shipment = await createShipment(input);
    refresh();
    return { success: true, data: { id: shipment.id, trackingNumber: shipment.trackingNumber } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateShipmentStatusAction(
  id: string,
  currentStatus: ShipmentStatus,
  nextStatus: ShipmentStatus,
  note?: string
): Promise<ActionResult> {
  // UX-level guard; the backend remains the source of truth and re-validates
  // this exact transition graph.
  if (!isValidTransition(currentStatus, nextStatus)) {
    return {
      success: false,
      message: `Cannot move a shipment from "${currentStatus}" to "${nextStatus}".`,
    };
  }

  try {
    await updateShipmentStatus(id, nextStatus, note);
    refresh();
    return { success: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiRequestError) {
    return { success: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  return { success: false, message: "Something went wrong. Please try again." };
}

function flattenZodErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
