// features/dashboard/components/webhook-stats.tsx
import { CheckCircle2, PauseCircle, Webhook } from "lucide-react";
import { getWebhooks } from "@/lib/webhook-service";
import { StatCard } from "./stat-card";

export async function WebhookStats() {
  const [total, active, inactive] = await Promise.all([
    getWebhooks({ limit: 1 }),
    getWebhooks({ limit: 1, isActive: true }),
    getWebhooks({ limit: 1, isActive: false }),
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        title="Total webhooks"
        value={total.pagination.total}
        icon={Webhook}
        href="/webhooks"
      />
      <StatCard title="Active" value={active.pagination.total} icon={CheckCircle2} />
      <StatCard title="Inactive" value={inactive.pagination.total} icon={PauseCircle} />
    </div>
  );
}
