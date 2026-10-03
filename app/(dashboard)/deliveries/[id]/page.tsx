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
import { getDelivery, isLegacyDeliveryAttempt } from "@/lib/delivery-service";
import { ApiRequestError } from "@/lib/server-fetch";
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";
import { DeliveryAttempts } from "@/features/deliveries/components/delivery-attempts";
import { ResendDeliveryButton } from "@/features/deliveries/components/resend-delivery-button";
import { getCurrentUser } from "@/lib/dal";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  let delivery;
  try {
    delivery = await getDelivery(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  const details = isLegacyDeliveryAttempt(delivery)
    ? {
        kind: "historical" as const,
        webhook: delivery.webhookId,
        event: delivery.eventId,
        attemptsLabel: `Historical attempt ${delivery.attemptNumber}`,
        lastAttemptAt: delivery.attemptedAt ?? delivery.createdAt,
      }
    : {
        kind: "delivery" as const,
        webhook: delivery.webhook,
        event: delivery.event,
        attemptsLabel: `${delivery.attemptCount}/${delivery.maxAttempts}`,
        lastAttemptAt: delivery.lastAttemptAt,
      };
  const deliveryId = delivery.id ?? delivery._id ?? id;
  const eventId = details.event && typeof details.event === "object"
    ? details.event.id ?? details.event._id
    : undefined;
  const eventLabel = details.event && typeof details.event === "object"
    ? details.event.type ?? details.event.eventId ?? "—"
    : details.event ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status]} className="mb-2">
            {delivery.status}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            {details.webhook && typeof details.webhook === "object" ? details.webhook.name : "Delivery"}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {details.webhook && typeof details.webhook === "object"
              ? details.webhook.url
              : (details.webhook ?? "Webhook deleted")}
          </p>
        </div>
        {delivery.status === "failed" ? (
          <ResendDeliveryButton deliveryId={deliveryId} />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Delivery summary.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Event</span>
            <span className="text-sm text-muted-foreground">
              {user?.role === "admin" && eventId ? (
                <Link href={`/events/${eventId}`} className="hover:underline">
                  {eventLabel}
                </Link>
              ) : (
                eventLabel
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Attempts</span>
            <span className="text-sm text-muted-foreground">
              {details.attemptsLabel}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Last attempt</span>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(details.lastAttemptAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attempt history</CardTitle>
          <CardDescription>
            Every attempt made to deliver this event to the webhook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryAttempts attempts={delivery.attempts} />
        </CardContent>
      </Card>
    </div>
  );
}
