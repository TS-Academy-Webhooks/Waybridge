// lib/format-event-type.ts
// "shipment.out_for_delivery" -> "Out for delivery"
export function formatEventType(type: string): string {
  const status = type.startsWith("shipment.") ? type.slice("shipment.".length) : type;
  const words = status.split("_");
  const [first, ...rest] = words;
  if (!first) return type;
  return [first[0].toUpperCase() + first.slice(1), ...rest].join(" ");
}
