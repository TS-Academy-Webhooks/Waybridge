// features/shipments/components/shipment-table.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getShipments } from "@/lib/shipment-service";
import { ShipmentRows } from "@/features/shipments/components/shipment-rows";

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
      <div className="rounded-md border">
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
