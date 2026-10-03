// features/events/components/event-table.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format-date";
import { formatEventType } from "@/lib/format-event-type";
import { getEvents } from "@/lib/event-service";
import type { EventType } from "@/constants/event-types";
import { Button } from "@/components/ui/button";

export async function EventTable({
  type,
  search,
  page,
}: {
  type?: EventType;
  search?: string;
  page?: number;
}) {
  const { items, pagination } = await getEvents({ type, search, page, limit: 15 });

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-16 text-center text-sm text-muted-foreground">
        No events yet. Events appear here as shipments move through their
        lifecycle.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 xl:hidden">
        {items.map((event) => (
          <li key={event.id} className="rounded-md border bg-card p-4">
            <div className="flex flex-col gap-2">
              <Link href={`/events/${event.id}`} className="w-fit hover:underline">
                <Badge variant="secondary">{formatEventType(event.type)}</Badge>
              </Link>
              <p className="text-xs text-muted-foreground">
                Occurred {formatDateTime(event.createdAt)}
              </p>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">Shipment</p>
              <p className="mt-1 break-all font-mono text-sm text-muted-foreground">
                {event.shipment && typeof event.shipment === "object"
                  ? event.shipment.trackingNumber
                  : (event.shipment ?? "—")}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden rounded-md border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Shipment</TableHead>
              <TableHead>Occurred</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    <Badge variant="secondary">{formatEventType(event.type)}</Badge>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {event.shipment && typeof event.shipment === "object"
                    ? event.shipment.trackingNumber
                                      : (event.shipment ?? "—")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationBar pagination={pagination} type={type} search={search} />
    </div>
  );
}

function PaginationBar({
  pagination,
  type,
  search,
}: {
  pagination: { page: number; totalPages: number };
  type?: string;
  search?: string;
}) {
  if (pagination.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (search) params.set("search", search);
    params.set("page", String(page));
    return `/events?${params.toString()}`;
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
