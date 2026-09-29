// features/events/components/event-deliveries.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format-date";
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";
import type { EventDelivery } from "@/lib/event-service";

export function EventDeliveries({ deliveries }: { deliveries: EventDelivery[] }) {
  if (deliveries.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        No webhook deliveries were triggered by this event.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Webhook</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Last attempt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell>
                <Link href={`/deliveries/${delivery.id}`} className="hover:underline">
                  {typeof delivery.webhook === "object"
                    ? delivery.webhook.name
                    : delivery.webhook}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status]}>
                  {delivery.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {delivery.attemptCount}/{delivery.maxAttempts}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(delivery.lastAttemptAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
