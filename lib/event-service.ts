// lib/event-service.ts
// Server-only data layer for shipment events — mirrors
// backend-my-part's src/controllers/event.controller.js:
//   GET /api/events            (?page&limit&type&shipmentId)
//   GET /api/events/:id        (also returns { event, deliveries })
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";

export type ShipmentEvent = {
  id: string;
  eventId: string;
  type: string;
  shipment: { id: string; trackingNumber: string } | string;
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
  webhook: { id: string; name: string; url: string } | string;
  createdAt: string;
};

export async function getEvent(
  id: string
): Promise<{ event: ShipmentEvent; deliveries: EventDelivery[] }> {
  return authFetch(`/events/${id}`);
}
