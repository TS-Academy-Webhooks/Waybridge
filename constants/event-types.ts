import { SHIPMENT_STATUSES, type ShipmentStatus } from "./shipment-status";

export type EventType =
  | "webhook.test"
  | `shipment.${ShipmentStatus}`;

export const EVENT_TYPES: EventType[] = [
  "webhook.test",
  ...SHIPMENT_STATUSES.map((status) => `shipment.${status}` as const),
];

const EVENT_TYPE_SET = new Set<string>(EVENT_TYPES);

export function isEventType(value: string | undefined): value is EventType {
  return value !== undefined && EVENT_TYPE_SET.has(value);
}
