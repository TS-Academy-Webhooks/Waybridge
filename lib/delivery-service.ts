// lib/delivery-service.ts
// Server-only data layer for delivery logs — uses the waybridge-be API:
//   GET  /api/deliveries               (?page&limit&status&webhookId&eventId&from&to)
//   GET  /api/deliveries/:id           (includes { ...delivery, attempts })
//   POST /api/deliveries/:id/resend    (202, re-queues; also aliased as /retry)
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";

export type DeliveryStatus = "pending" | "success" | "failed";

export type Delivery = {
  id: string;
  status: DeliveryStatus;
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  event: { id: string; eventId: string; type: string } | string | null;
  webhook: { id: string; name: string; url: string } | string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryAttempt = {
  id: string;
  attemptNumber: number;
  status: "success" | "failed";
  statusCode: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
};

export type DeliveryListParams = {
  page?: number;
  limit?: number;
  status?: DeliveryStatus;
  webhookId?: string;
  eventId?: string;
  from?: string;
  to?: string;
};

export async function getDeliveries(
  params: DeliveryListParams = {}
): Promise<{ items: Delivery[]; pagination: Pagination }> {
  const query = buildQuery(params);
  return authFetch(`/deliveries${query}`);
}

export async function getDelivery(
  id: string
): Promise<Delivery & { attempts: DeliveryAttempt[] }> {
  return authFetch(`/deliveries/${id}`);
}

export async function resendDelivery(id: string): Promise<Delivery> {
  return authFetch(`/deliveries/${id}/resend`, { method: "POST" });
}
