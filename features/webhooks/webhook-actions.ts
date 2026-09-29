// features/webhooks/webhook-actions.ts
// Server Actions for webhook mutations. Called from Client Components via
// `startTransition(() => action(values))` (react-hook-form manages state as
// a plain object, not FormData). Each action returns a small result object
// the calling form/component uses to show field errors or a toast, then
// calls `refresh()` on success so Server Components re-fetch fresh data.
"use server";

import { refresh } from "next/cache";
import { ApiRequestError } from "@/lib/server-fetch";
import {
  createWebhook,
  deleteWebhook,
  testWebhook,
  updateWebhook,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from "@/lib/webhook-service";
import { webhookFormSchema, type WebhookFormValues } from "@/lib/validate-webhook";
import type { FieldErrors } from "@/lib/api-error";

export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; message: string; fieldErrors?: FieldErrors };

export async function createWebhookAction(
  values: WebhookFormValues
): Promise<ActionResult<{ id: string; secret: string }>> {
  const parsed = webhookFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const input: CreateWebhookInput = parsed.data;
    const webhook = await createWebhook(input);
    refresh();
    return { success: true, data: { id: webhook.id, secret: webhook.secret } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateWebhookAction(
  id: string,
  values: WebhookFormValues,
  regenerateSecret = false
): Promise<ActionResult<{ id: string; secret: string }>> {
  const parsed = webhookFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const input: UpdateWebhookInput = { ...parsed.data, regenerateSecret };
    const webhook = await updateWebhook(id, input);
    refresh();
    return { success: true, data: { id: webhook.id, secret: webhook.secret } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleWebhookAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await updateWebhook(id, { isActive });
    refresh();
    return { success: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteWebhookAction(id: string): Promise<ActionResult> {
  try {
    await deleteWebhook(id);
    refresh();
    return { success: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

export async function testWebhookAction(id: string): Promise<ActionResult> {
  try {
    await testWebhook(id);
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
