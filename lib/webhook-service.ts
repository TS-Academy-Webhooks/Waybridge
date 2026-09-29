// lib/webhook-service.ts
// Server-only data layer for webhooks — mirrors backend-my-part's
// src/controllers/webhook.controller.js exactly:
//   POST   /api/webhooks
//   GET    /api/webhooks           (?page&limit&search&isActive&event)
//   GET    /api/webhooks/:id
//   PUT    /api/webhooks/:id       (partial body; NOT PATCH)
//   DELETE /api/webhooks/:id
//   GET    /api/webhooks/:id/deliveries
//   POST   /api/webhooks/:id/test
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";

export type Webhook = {
  id: string;
  user: string;
  name: string;
  url: string;
  secret: string; // full secret only on create / regenerateSecret; masked otherwise
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type WebhookListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  event?: string;
};

export type Delivery = {
  id: string;
  event: { id: string; eventId: string; type: string };
  webhook: string;
  user: string;
  status: "pending" | "success" | "failed";
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getWebhooks(
  params: WebhookListParams = {}
): Promise<{ items: Webhook[]; pagination: Pagination }> {
  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    search: params.search,
    isActive: params.isActive,
    event: params.event,
  });
  return authFetch(`/webhooks${query}`);
}

export async function getWebhook(id: string): Promise<Webhook> {
  return authFetch(`/webhooks/${id}`);
}

export type CreateWebhookInput = {
  name: string;
  url: string;
  events: string[];
  isActive?: boolean;
};

export async function createWebhook(input: CreateWebhookInput): Promise<Webhook> {
  return authFetch("/webhooks", { method: "POST", body: input });
}

export type UpdateWebhookInput = Partial<CreateWebhookInput> & {
  regenerateSecret?: boolean;
};

export async function updateWebhook(
  id: string,
  input: UpdateWebhookInput
): Promise<Webhook> {
  return authFetch(`/webhooks/${id}`, { method: "PUT", body: input });
}

export async function toggleWebhook(id: string, isActive: boolean): Promise<Webhook> {
  return updateWebhook(id, { isActive });
}

export async function deleteWebhook(id: string): Promise<null> {
  return authFetch(`/webhooks/${id}`, { method: "DELETE" });
}

export async function getWebhookDeliveries(
  id: string,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<{ items: Delivery[]; pagination: Pagination }> {
  const query = buildQuery(params);
  return authFetch(`/webhooks/${id}/deliveries${query}`);
}

export async function testWebhook(id: string): Promise<Delivery> {
  return authFetch(`/webhooks/${id}/test`, { method: "POST" });
}
