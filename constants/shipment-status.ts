// constants/shipment-status.ts
// Single source of truth for the shipment lifecycle, mirrored from
// waybridge-be/src/services/shipmentService.js.
// Shared by the public tracking page, the shipment management pages (Track C),
// and webhook event selection (constants/webhook-events.ts).

export type ShipmentStatus =
  | "created"
  | "picked_up"
  | "in_transit"
  | "arrived_at_hub"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "cancelled";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "created",
  "picked_up",
  "in_transit",
  "arrived_at_hub",
  "out_for_delivery",
  "delivered",
  "delivery_failed",
  "cancelled",
];

// Mirrors the merged backend's transition map exactly.
export const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  created: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["arrived_at_hub", "cancelled"],
  arrived_at_hub: ["in_transit", "out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "delivery_failed"],
  delivery_failed: ["out_for_delivery", "cancelled"], // retry redelivery
  delivered: [],
  cancelled: [],
};

export function isValidTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function formatShipmentStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export const SHIPMENT_STATUS_BADGE_VARIANT: Record<
  ShipmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  created: "secondary",
  picked_up: "secondary",
  in_transit: "default",
  arrived_at_hub: "default",
  out_for_delivery: "default",
  delivered: "default",
  delivery_failed: "destructive",
  cancelled: "outline",
};
