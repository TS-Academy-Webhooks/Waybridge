import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShipmentFilters } from "@/features/shipments/components/shipment-filters";
import { ShipmentTable } from "@/features/shipments/components/shipment-table";
import { ShipmentTableSkeleton } from "@/features/shipments/components/shipment-table-skeleton";

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Track and manage shipments across their lifecycle.
          </p>
        </div>
        <Button asChild className="w-full lg:w-auto">
          <Link href="/shipments/new">
            <Plus />
            New shipment
          </Link>
        </Button>
      </div>
      <ShipmentFilters />
      <Suspense
        key={`${params.search ?? ""}-${params.status ?? ""}-${params.page ?? ""}`}
        fallback={<ShipmentTableSkeleton />}
      >
        <ShipmentTable search={params.search} status={params.status} page={page} />
      </Suspense>
    </div>
  );
}
