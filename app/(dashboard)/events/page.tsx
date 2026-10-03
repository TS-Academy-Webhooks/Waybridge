import { Suspense } from "react";
import { EventFilters } from "@/features/events/components/event-filters";
import { EventTable } from "@/features/events/components/event-table";
import { EventTableSkeleton } from "@/features/events/components/event-table-skeleton";
import { isEventType } from "@/constants/event-types";
import { requireAdmin } from "@/lib/dal";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string; page?: string }>;
}) {
  const [params] = await Promise.all([searchParams, requireAdmin()]);
  const page = params.page ? Number(params.page) : undefined;
  const type = isEventType(params.type) ? params.type : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          A log of every shipment lifecycle event, and the webhook deliveries
          they triggered.
        </p>
      </div>
      <EventFilters />
      <Suspense
        key={`${type ?? ""}-${params.search ?? ""}-${params.page ?? ""}`}
        fallback={<EventTableSkeleton />}
      >
        <EventTable type={type} search={params.search} page={page} />
      </Suspense>
    </div>
  );
}
