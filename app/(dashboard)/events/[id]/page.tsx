import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-date";
import { formatEventType } from "@/lib/format-event-type";
import { getEvent } from "@/lib/event-service";
import { ApiRequestError } from "@/lib/server-fetch";
import { EventDeliveries } from "@/features/events/components/event-deliveries";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event, deliveries;
  try {
    ({ event, deliveries } = await getEvent(id));
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {formatEventType(event.type)}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          Event {event.eventId}
        </h1>
        <p className="text-muted-foreground">
          Occurred {formatDateTime(event.createdAt)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Shipment and payload for this event.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Shipment</span>
            <span className="text-sm text-muted-foreground">
              {event.shipment && typeof event.shipment === "object" ? (
                <Link
                  href={`/shipments/${event.shipment.id}`}
                  className="font-mono hover:underline"
                >
                  {event.shipment.trackingNumber}
                </Link>
              ) : (
                (event.shipment ?? "—")
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Payload</span>
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook deliveries</CardTitle>
          <CardDescription>
            Deliveries triggered by this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventDeliveries deliveries={deliveries} />
        </CardContent>
      </Card>
    </div>
  );
}
