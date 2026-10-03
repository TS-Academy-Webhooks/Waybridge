// features/shipments/components/shipment-table.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import { getShipments } from "@/lib/shipment-service";
import { ShipmentRows } from "@/features/shipments/components/shipment-rows";
import {
  SHIPMENT_STATUS_BADGE_VARIANT,
  formatShipmentStatus,
  type ShipmentStatus,
} from "@/constants/shipment-status";

export async function ShipmentTable({
  search,
  status,
  page,
}: {
  search?: string;
  status?: string;
  page?: number;
}) {
  const { items, pagination } = await getShipments({ search, status, page, limit: 10 });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-16 text-center">
        <p className="font-medium">No shipments found</p>
        <p className="text-sm text-muted-foreground">
          {search || status
            ? "Try adjusting your search or filters."
            : "Create your first shipment to start tracking it."}
        </p>
        <Button asChild className="mt-2">
          <Link href="/shipments/new">New shipment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 xl:hidden">
        {items.map((shipment) => (
          <li key={shipment.id} className="rounded-md border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/shipments/${shipment.id}`}
                  className="break-all font-mono font-medium hover:underline"
                >
                  {shipment.trackingNumber}
                </Link>
                <p className="mt-1 break-words text-sm">{shipment.customer}</p>
              </div>
              <Badge
                variant={SHIPMENT_STATUS_BADGE_VARIANT[shipment.status as ShipmentStatus] ?? "secondary"}
                className="shrink-0"
              >
                {formatShipmentStatus(shipment.status)}
              </Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Origin</dt>
                <dd className="mt-1 break-words">{shipment.origin}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Destination</dt>
                <dd className="mt-1 break-words">{shipment.destination}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Created {formatDate(shipment.createdAt)}
            </p>
          </li>
        ))}
      </ul>
      <div className="hidden rounded-md border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <ShipmentRows items={items} />
        </Table>
      </div>
      <PaginationBar pagination={pagination} search={search} status={status} />
    </div>
  );
}

function PaginationBar({
  pagination,
  search,
  status,
}: {
  pagination: { page: number; totalPages: number };
  search?: string;
  status?: string;
}) {
  if (pagination.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", String(page));
    return `/shipments?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        {pagination.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(pagination.page - 1)}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {pagination.page < pagination.totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(pagination.page + 1)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
