import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WebhookStats } from "@/features/dashboard/components/webhook-stats";
import { ShipmentStats } from "@/features/dashboard/components/shipment-stats";
import { DeliveryStats } from "@/features/dashboard/components/delivery-stats";
import { RecentShipments } from "@/features/dashboard/components/recent-shipments";
import { FailedDeliveries } from "@/features/dashboard/components/failed-deliveries";
import { StatsSkeleton } from "@/features/dashboard/components/stats-skeleton";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          A snapshot of your shipments, webhooks, and deliveries.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Shipments</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <ShipmentStats />
        </Suspense>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Deliveries</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <DeliveryStats />
        </Suspense>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Webhooks</h2>
        <Suspense fallback={<StatsSkeleton count={3} />}>
          <WebhookStats />
        </Suspense>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent shipments</CardTitle>
            <CardDescription>The latest shipments created on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <RecentShipments />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed deliveries</CardTitle>
            <CardDescription>Deliveries that need attention or a resend.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <FailedDeliveries />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
