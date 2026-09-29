// lib/validate-webhook.ts
// Shared zod schema for the create/edit webhook forms. No "server-only" here
// on purpose — it's used by the client Form component's resolver as well as
// by the Server Action for defense-in-depth validation.
import { z } from "zod";

export const webhookFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Enter a valid URL, including https://"),
  events: z.array(z.string()).min(1, "Select at least one event"),
  isActive: z.boolean(),
});

export type WebhookFormValues = z.infer<typeof webhookFormSchema>;

export const webhookFormDefaults: WebhookFormValues = {
  name: "",
  url: "",
  events: [],
  isActive: true,
};
