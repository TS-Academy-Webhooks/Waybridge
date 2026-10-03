// lib/delivery-service.ts
// Server-only data layer for delivery logs — uses the waybridge-be API:
//   GET  /api/deliveries               (?page&limit&status&webhookId&eventId)
//   GET  /api/deliveries/:id           (includes { ...delivery, attempts })
//   POST /api/deliveries/:id/resend    (202, re-queues; also aliased as /retry)
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";

export type DeliveryStatus = "pending" | "success" | "failed";

export type DeliveryReference = {
  id?: string;
  _id?: string;
  eventId?: string;
  type?: string;
  name?: string;
  url?: string;
  payload?: Record<string, unknown>;
};

export type Delivery = {
  _id?: string;
  id: string;
  status: DeliveryStatus;
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string | null;
  eventId?: DeliveryReference | string;
  webhookId?: DeliveryReference | string;
  ownerId?: string;
  event?: DeliveryReference | string | null;
  webhook?: DeliveryReference | string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryAttempt = {
  _id?: string;
  id?: string;
  deliveryId?: string | null;
  webhookId?: DeliveryReference | string;
  eventId?: DeliveryReference | string;
  attemptNumber: number;
  status: "success" | "failed";
  httpStatus?: number | null;
  statusCode?: number | null;
  response?: string | null;
  responseBody?: string | null;
  errorMessage: string | null;
  duration?: number | null;
  durationMs?: number | null;
  attemptedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type DeliveryDetail =
  | (Delivery & { attempts: DeliveryAttempt[] })
  | LegacyDeliveryAttempt;

export type LegacyDeliveryAttempt = DeliveryAttempt & {
  delivery: null;
  attempts: DeliveryAttempt[];
};

export function isLegacyDeliveryAttempt(
  delivery: DeliveryDetail
): delivery is LegacyDeliveryAttempt {
  return "delivery" in delivery && delivery.delivery === null;
}

export type DeliveryListParams = {
  page?: number;
  limit?: number;
  status?: DeliveryStatus;
  webhookId?: string;
  eventId?: string;
};

export async function getDeliveries(
  params: DeliveryListParams = {}
): Promise<{ items: Delivery[]; pagination: Pagination }> {
  const query = buildQuery(params);
  return authFetch(`/deliveries${query}`);
}

export async function getDelivery(
  id: string
): Promise<DeliveryDetail> {
  return authFetch(`/deliveries/${id}`);
}

export async function resendDelivery(id: string): Promise<Delivery> {
  return authFetch(`/deliveries/${id}/resend`, { method: "POST" });
}
