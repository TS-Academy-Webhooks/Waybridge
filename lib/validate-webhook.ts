// lib/validate-webhook.ts
// Shared zod schema for the create/edit webhook forms. No "server-only" here
// on purpose — it's used by the client Form component's resolver as well as
// by the Server Action for defense-in-depth validation.
import { z } from "zod";
import { WEBHOOK_EVENT_OPTIONS } from "@/constants/webhook-events";

export const webhookFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Enter a valid URL, including https://")
    .refine((value) => {
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) &&
          !url.username &&
          !url.password;
      } catch {
        return false;
      }
    }, "Use an HTTP or HTTPS URL without embedded credentials"),
  events: z.array(
    z.string().refine(
      (value) => WEBHOOK_EVENT_OPTIONS.some((option) => option.value === value),
      "Choose a supported event"
    )
  ).min(1, "Select at least one event"),
  isActive: z.boolean(),
});

export type WebhookFormValues = z.infer<typeof webhookFormSchema>;

export const webhookFormDefaults: WebhookFormValues = {
  name: "",
  url: "",
  events: [],
  isActive: true,
};
