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
import { getDelivery } from "@/lib/delivery-service";
import { ApiRequestError } from "@/lib/server-fetch";
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";
import { DeliveryAttempts } from "@/features/deliveries/components/delivery-attempts";
import { ResendDeliveryButton } from "@/features/deliveries/components/resend-delivery-button";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let delivery;
  try {
    delivery = await getDelivery(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status]} className="mb-2">
            {delivery.status}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            {delivery.webhook && typeof delivery.webhook === "object" ? delivery.webhook.name : "Delivery"}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {delivery.webhook && typeof delivery.webhook === "object" ? delivery.webhook.url : (delivery.webhook ?? "Webhook deleted")}
          </p>
        </div>
        {delivery.status === "failed" ? (
          <ResendDeliveryButton deliveryId={delivery.id} />
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
              {delivery.event && typeof delivery.event === "object" ? (
                <Link href={`/events/${delivery.event.id}`} className="hover:underline">
                  {delivery.event.type}
                </Link>
              ) : (
                (delivery.event ?? "—")
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Attempts</span>
            <span className="text-sm text-muted-foreground">
              {delivery.attemptCount}/{delivery.maxAttempts}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Last attempt</span>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(delivery.lastAttemptAt)}
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
