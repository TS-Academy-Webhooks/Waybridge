import { WebhookForm } from "@/features/webhooks/components/webhook-form";
import { DEMO_RECEIVER_URL } from "@/lib/api-config";

export default function NewWebhookPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New webhook</h1>
        <p className="text-muted-foreground">
          Subscribe an endpoint to shipment lifecycle events.
        </p>
      </div>
      <WebhookForm mode="create" demoReceiverUrl={DEMO_RECEIVER_URL} />
    </div>
  );
}
