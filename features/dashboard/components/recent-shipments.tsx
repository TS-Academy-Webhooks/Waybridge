// features/dashboard/components/recent-shipments.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getShipments } from "@/lib/shipment-service";
import { formatDateTime } from "@/lib/format-date";
import {
  SHIPMENT_STATUS_BADGE_VARIANT,
  formatShipmentStatus,
} from "@/constants/shipment-status";

export async function RecentShipments() {
  const { items } = await getShipments({ limit: 5 });

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No shipments yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {items.map((shipment) => (
        <li key={shipment.id} className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/shipments/${shipment.id}`}
              className="font-mono text-sm hover:underline"
            >
              {shipment.trackingNumber}
            </Link>
            <span className="text-xs text-muted-foreground">
              {shipment.customer} · {formatDateTime(shipment.createdAt)}
            </span>
          </div>
          <Badge variant={SHIPMENT_STATUS_BADGE_VARIANT[shipment.status]}>
            {formatShipmentStatus(shipment.status)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
