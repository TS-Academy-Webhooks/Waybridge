import { Suspense } from "react";
import { DeliveryFilters } from "@/features/deliveries/components/delivery-filters";
import { DeliveryTable } from "@/features/deliveries/components/delivery-table";
import { DeliveryTableSkeleton } from "@/features/deliveries/components/delivery-table-skeleton";

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deliveries</h1>
        <p className="text-muted-foreground">
          Every webhook delivery attempt across your endpoints. Resend failed
          deliveries once you&apos;ve fixed the issue.
        </p>
      </div>
      <DeliveryFilters />
      <Suspense
        key={`${params.status ?? ""}-${params.page ?? ""}`}
        fallback={<DeliveryTableSkeleton />}
      >
        <DeliveryTable status={params.status} page={page} />
      </Suspense>
    </div>
  );
}
