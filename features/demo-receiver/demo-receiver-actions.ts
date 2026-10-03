"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { ApiRequestError } from "@/lib/server-fetch";
import {
  clearDemoReceiverHistory,
  resetDemoReceiverConfiguration,
  updateDemoReceiverConfiguration,
  type DemoReceiverConfigurationUpdate,
  type JsonValue,
} from "@/lib/demo-receiver-service";

export type DemoReceiverActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; message: string };

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null) &&
    Object.values(value).every(isJsonValue);
}

const configurationUpdateSchema = z.object({
  success: z.object({
    statusCode: z.number().int().min(200).max(299),
    body: z.custom<JsonValue>(isJsonValue).optional(),
  }).strict().optional(),
  failure: z.object({
    statusCode: z.number().int().min(400).max(599),
    body: z.custom<JsonValue>(isJsonValue).optional(),
  }).strict().optional(),
}).strict().refine(
  (input) => input.success !== undefined || input.failure !== undefined,
  "Provide a success or failure response profile."
);

export async function updateDemoReceiverConfigurationAction(
  input: unknown
): Promise<DemoReceiverActionResult> {
  const parsed = configurationUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the response status codes and JSON bodies.",
    };
  }

  try {
    const update: DemoReceiverConfigurationUpdate = parsed.data;
    await updateDemoReceiverConfiguration(update);
    refresh();
    return { success: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

export async function clearDemoReceiverHistoryAction(): Promise<
  DemoReceiverActionResult<{ clearedCount: number }>
> {
  try {
    const result = await clearDemoReceiverHistory();
    refresh();
    return { success: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resetDemoReceiverConfigurationAction(): Promise<DemoReceiverActionResult> {
  try {
    await resetDemoReceiverConfiguration();
    refresh();
    return { success: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

function toActionError(error: unknown): DemoReceiverActionResult<never> {
  if (error instanceof ApiRequestError) {
    return { success: false, message: error.message };
  }
  return { success: false, message: "Something went wrong. Please try again." };
}
