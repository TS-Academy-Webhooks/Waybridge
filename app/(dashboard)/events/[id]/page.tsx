import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-date";
import { formatEventType } from "@/lib/format-event-type";
import {
  getEvent,
  getEventDeliveries,
  type EventDelivery,
  type ShipmentEvent,
} from "@/lib/event-service";
import { ApiRequestError } from "@/lib/server-fetch";
import { requireAdmin } from "@/lib/dal";
import { EventDeliveries } from "@/features/events/components/event-deliveries";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  let event: ShipmentEvent;
  try {
    event = await getEvent(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  let deliveries: EventDelivery[] = [];
  let deliveryErrorMessage: string | null = null;
  try {
    deliveries = await getEventDeliveries(event);
  } catch (error) {
    if (!(error instanceof ApiRequestError)) throw error;
    deliveryErrorMessage = getDeliveryErrorMessage(error);
  }

  const shipment = event.shipment && typeof event.shipment === "object"
    ? event.shipment
    : null;
  const shipmentId = shipment?.id ?? shipment?._id;

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
              {shipment && shipmentId ? (
                <Link
                  href={`/shipments/${shipmentId}`}
                  className="font-mono hover:underline"
                >
                  {shipment.trackingNumber}
                </Link>
              ) : (
                (shipment?.trackingNumber ??
                  (typeof event.shipment === "string" ? event.shipment : "—"))
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
          {deliveryErrorMessage ? (
            <Alert className="border-muted bg-muted/40">
              <Info />
              <AlertTitle>Delivery history unavailable</AlertTitle>
              <AlertDescription>{deliveryErrorMessage}</AlertDescription>
            </Alert>
          ) : (
            <EventDeliveries deliveries={deliveries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getDeliveryErrorMessage(error: ApiRequestError): string {
  if (error.status === 404) {
    return "Event details are available, but the API could not find its delivery history.";
  }
  if (error.status === 0) {
    return "Event details are available, but the backend could not be reached to load delivery history.";
  }
  return `Event details are available, but delivery history could not be loaded (HTTP ${error.status}).`;
}
