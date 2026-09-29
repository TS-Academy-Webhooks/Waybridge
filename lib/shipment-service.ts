// lib/shipment-service.ts
// Server-only data layer for shipments — mirrors backend-my-part's
// src/controllers/shipment.controller.js exactly:
//   POST  /api/shipments             (admin/operations only)
//   GET   /api/shipments             (?page&limit&search&status)
//   GET   /api/shipments/:id
//   PATCH /api/shipments/:id/status  (admin/operations only)
import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";
import type { ShipmentStatus } from "@/constants/shipment-status";

export type ShipmentTimelineEntry = {
  status: ShipmentStatus;
  note?: string;
  at: string;
};

export type Shipment = {
  id: string;
  trackingNumber: string;
  customer: string;
  origin: string;
  destination: string;
  amount: number;
  status: ShipmentStatus;
  timeline: ShipmentTimelineEntry[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type ShipmentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export async function getShipments(
  params: ShipmentListParams = {}
): Promise<{ items: Shipment[]; pagination: Pagination }> {
  const query = buildQuery(params);
  return authFetch(`/shipments${query}`);
}

export async function getShipment(id: string): Promise<Shipment> {
  return authFetch(`/shipments/${id}`);
}

export type CreateShipmentInput = {
  customer: string;
  origin: string;
  destination: string;
  amount: number;
};

export async function createShipment(input: CreateShipmentInput): Promise<Shipment> {
  return authFetch("/shipments", { method: "POST", body: input });
}

export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  note?: string
): Promise<Shipment> {
  return authFetch(`/shipments/${id}/status`, {
    method: "PATCH",
    body: { status, note },
  });
}
