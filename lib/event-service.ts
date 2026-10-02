// lib/event-service.ts
// Server-only data layer for shipment events — uses the waybridge-be API:
//   GET /api/events            (?page&limit&type&shipmentId)
//   GET /api/events/:id        (event document; deliveries are fetched separately)
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";

export type ShipmentEvent = {
  id: string;
  eventId: string;
  type: string;
  shipment: { id: string; trackingNumber: string } | string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type EventListParams = {
  page?: number;
  limit?: number;
  type?: string;
  shipmentId?: string;
};

export async function getEvents(
  params: EventListParams = {}
): Promise<{ items: ShipmentEvent[]; pagination: Pagination }> {
  const query = buildQuery(params);
  return authFetch(`/events${query}`);
}

export type EventDelivery = {
  id: string;
  status: "pending" | "success" | "failed";
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  webhook: { id: string; name: string; url: string } | string | null;
  createdAt: string;
};

export async function getEvent(
  id: string
): Promise<{ event: ShipmentEvent; deliveries: EventDelivery[] }> {
  const [event, deliveries] = await Promise.all([
    authFetch<ShipmentEvent>(`/events/${id}`),
    authFetch<{ items: EventDelivery[] }>(
      `/deliveries${buildQuery({ eventId: id, limit: 50 })}`
    ),
  ]);
  return { event, deliveries: deliveries.items };
}
