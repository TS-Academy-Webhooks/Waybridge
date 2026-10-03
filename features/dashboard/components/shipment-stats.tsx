// features/dashboard/components/shipment-stats.tsx
import { AlertTriangle, CheckCircle2, Package, Truck } from "lucide-react";
import { getShipments } from "@/lib/shipment-service";
import { StatCard } from "./stat-card";

export async function ShipmentStats() {
  const [total, inTransit, delivered, failed] = await Promise.all([
    getShipments({ limit: 1 }),
    getShipments({ limit: 1, status: "in_transit" }),
    getShipments({ limit: 1, status: "delivered" }),
    getShipments({ limit: 1, status: "delivery_failed" }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Total shipments"
        value={total.pagination.total}
        icon={Package}
        href="/shipments"
      />
      <StatCard title="In transit" value={inTransit.pagination.total} icon={Truck} />
      <StatCard
        title="Delivered"
        value={delivered.pagination.total}
        icon={CheckCircle2}
      />
      <StatCard
        title="Delivery failed"
        value={failed.pagination.total}
        icon={AlertTriangle}
      />
    </div>
  );
}
