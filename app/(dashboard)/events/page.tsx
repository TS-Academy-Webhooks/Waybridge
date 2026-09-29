import { Suspense } from "react";
import { EventFilters } from "@/features/events/components/event-filters";
import { EventTable } from "@/features/events/components/event-table";
import { EventTableSkeleton } from "@/features/events/components/event-table-skeleton";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : undefined;

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
        key={`${params.type ?? ""}-${params.page ?? ""}`}
        fallback={<EventTableSkeleton />}
      >
        <EventTable type={params.type} page={page} />
      </Suspense>
    </div>
  );
}
