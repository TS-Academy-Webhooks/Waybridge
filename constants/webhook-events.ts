// constants/webhook-events.ts
// The event types a webhook can subscribe to, derived from the shared
// shipment status list (constants/shipment-status.ts). "*" ("All events") is
// handled separately since it isn't a real status.
import { SHIPMENT_STATUSES, formatShipmentStatus } from "./shipment-status";

export type WebhookEventOption = {
  value: string;
  label: string;
};

export const WEBHOOK_EVENT_OPTIONS: WebhookEventOption[] = [
  { value: "*", label: "All events" },
  ...SHIPMENT_STATUSES.map((status) => ({
    value: `shipment.${status}`,
    label: formatShipmentStatus(status),
  })),
];
