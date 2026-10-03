// features/dashboard/components/delivery-stats.tsx
import { CheckCircle2, Clock, SendHorizonal, XCircle } from "lucide-react";
import { getDeliveries } from "@/lib/delivery-service";
import { StatCard } from "./stat-card";

export async function DeliveryStats() {
  const [total, success, pending, failed] = await Promise.all([
    getDeliveries({ limit: 1 }),
    getDeliveries({ limit: 1, status: "success" }),
    getDeliveries({ limit: 1, status: "pending" }),
    getDeliveries({ limit: 1, status: "failed" }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Total deliveries"
        value={total.pagination.total}
        icon={SendHorizonal}
        href="/deliveries"
      />
      <StatCard title="Successful" value={success.pagination.total} icon={CheckCircle2} />
      <StatCard title="Pending" value={pending.pagination.total} icon={Clock} />
      <StatCard title="Failed" value={failed.pagination.total} icon={XCircle} />
    </div>
  );
}
