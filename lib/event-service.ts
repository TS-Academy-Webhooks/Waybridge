// lib/event-service.ts
// Server-only data layer for shipment events — uses the waybridge-be API:
//   GET /api/events            (?page&limit&type&search) — admin only
//   GET /api/events/:id        (event document; deliveries are fetched separately)
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";
import type { EventType } from "@/constants/event-types";

export type ShipmentReference = {
  id?: string;
  _id?: string;
  trackingNumber: string;
  status?: string;
};

export type ShipmentEvent = {
  _id?: string;
  id: string;
  eventId: string;
  type: EventType;
  shipment?: ShipmentReference | string | null;
  shipmentId?: ShipmentReference | string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type EventListParams = {
  page?: number;
  limit?: number;
  type?: EventType;
  search?: string;
};

export async function getEvents(
  params: EventListParams = {}
): Promise<{ items: ShipmentEvent[]; pagination: Pagination }> {
  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    type: params.type,
    search: params.search,
  });
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
  const event = await authFetch<ShipmentEvent>(`/events/${id}`);
  const eventDocumentId = event._id ?? event.id;
  const deliveries = await authFetch<{ items: EventDelivery[] }>(
    `/deliveries${buildQuery({ eventId: eventDocumentId, limit: 50 })}`
  );
  return { event, deliveries: deliveries.items };
}
