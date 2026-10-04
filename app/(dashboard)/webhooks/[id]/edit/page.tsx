import { notFound } from "next/navigation";
import { WebhookForm } from "@/features/webhooks/components/webhook-form";
import { getWebhook } from "@/lib/webhook-service";
import { ApiRequestError } from "@/lib/server-fetch";
import { DEMO_RECEIVER_URL } from "@/lib/api-config";
import { DashboardBreadcrumbTitle } from "@/features/dashboard/components/dashboard-breadcrumbs";

export default async function EditWebhookPage({
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
      <DashboardBreadcrumbTitle
        href={`/webhooks/${encodeURIComponent(id)}/edit`}
        label={`Edit ${webhook.name}`}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit webhook</h1>
        <p className="text-muted-foreground">{webhook.name}</p>
      </div>
      <WebhookForm
        mode="edit"
        webhookId={webhook.id}
        demoReceiverUrl={DEMO_RECEIVER_URL}
        defaultValues={{
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          isActive: webhook.isActive,
        }}
      />
    </div>
  );
}
