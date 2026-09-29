// features/deliveries/delivery-actions.ts
"use server";

import { refresh } from "next/cache";
import { ApiRequestError } from "@/lib/server-fetch";
import { resendDelivery } from "@/lib/delivery-service";

export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function resendDeliveryAction(id: string): Promise<ActionResult> {
  try {
    await resendDelivery(id);
    refresh();
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
