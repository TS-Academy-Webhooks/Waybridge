// features/dashboard/components/failed-deliveries.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getDeliveries } from "@/lib/delivery-service";
import { formatDateTime } from "@/lib/format-date";
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";
import { ResendDeliveryButton } from "@/features/deliveries/components/resend-delivery-button";

export async function FailedDeliveries() {
  const { items } = await getDeliveries({ status: "failed", limit: 5 });

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No failed deliveries. Everything is healthy.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {items.map((delivery) => (
        <li key={delivery.id} className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/deliveries/${delivery.id}`}
              className="text-sm hover:underline"
            >
              {typeof delivery.webhook === "object" && delivery.webhook !== null ? delivery.webhook.name : delivery.webhook}
            </Link>
            <span className="text-xs text-muted-foreground">
              {delivery.attemptCount}/{delivery.maxAttempts} attempts ·{" "}
              {formatDateTime(delivery.lastAttemptAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status]}>
              {delivery.status}
            </Badge>
            <ResendDeliveryButton deliveryId={delivery.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
