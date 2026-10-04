import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format-date";
import { getWebhook } from "@/lib/webhook-service";
import { ApiRequestError } from "@/lib/server-fetch";
import { EventBadges } from "@/features/webhooks/components/event-badges";
import { WebhookStatus } from "@/features/webhooks/components/webhook-status";
import { DeleteWebhookDialog } from "@/features/webhooks/components/delete-webhook-dialog";
import { TestWebhookButton } from "@/features/webhooks/components/test-webhook-button";
import { DeliveryLogTable } from "@/features/webhooks/components/delivery-log-table";

export default async function WebhookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let webhook;
  try {
    webhook = await getWebhook(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight">
            {webhook.name}
          </h1>
          <p className="break-all font-mono text-sm text-muted-foreground">
            {webhook.url}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TestWebhookButton id={webhook.id} />
          <Button asChild variant="outline">
            <Link href={`/webhooks/${webhook.id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <DeleteWebhookDialog id={webhook.id} name={webhook.name} redirectTo="/webhooks" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Subscription and delivery settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Status</span>
            <WebhookStatus id={webhook.id} isActive={webhook.isActive} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Subscribed events</span>
            <EventBadges events={webhook.events} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Created</span>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(webhook.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent deliveries</CardTitle>
          <CardDescription>
            The last 5 delivery summaries and their attempt counts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <DeliveryLogTable webhookId={webhook.id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
