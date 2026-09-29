// features/webhooks/components/delivery-log-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format-date";
import { formatEventType } from "@/lib/format-event-type";
import { getWebhookDeliveries } from "@/lib/webhook-service";
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";

export async function DeliveryLogTable({ webhookId }: { webhookId: string }) {
  const { items } = await getWebhookDeliveries(webhookId, { limit: 5 });

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        No deliveries yet. Deliveries appear here once a matching shipment
        event fires or you send a test event.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Last attempt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell>{formatEventType(delivery.event.type)}</TableCell>
              <TableCell>
                <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status] ?? "secondary"}>
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
