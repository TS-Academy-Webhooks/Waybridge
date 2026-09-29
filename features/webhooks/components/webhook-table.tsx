// features/webhooks/components/webhook-table.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getWebhooks } from "@/lib/webhook-service";
import { WebhookRows } from "@/features/webhooks/components/webhook-rows";

export async function WebhookTable({
  search,
  isActive,
  page,
}: {
  search?: string;
  isActive?: string;
  page?: number;
}) {
  const { items, pagination } = await getWebhooks({
    search,
    isActive: isActive === undefined ? undefined : isActive === "true",
    page,
    limit: 10,
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-16 text-center">
        <p className="font-medium">No webhooks found</p>
        <p className="text-sm text-muted-foreground">
          {search || isActive
            ? "Try adjusting your search or filters."
            : "Create your first webhook to start receiving shipment events."}
        </p>
        <Button asChild className="mt-2">
          <Link href="/webhooks/new">New webhook</Link>
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
              <TableHead>Name</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <WebhookRows items={items} />
        </Table>
      </div>
      <PaginationBar pagination={pagination} search={search} isActive={isActive} />
    </div>
  );
}

function PaginationBar({
  pagination,
  search,
  isActive,
}: {
  pagination: { page: number; totalPages: number };
  search?: string;
  isActive?: string;
}) {
  if (pagination.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (isActive) params.set("isActive", isActive);
    params.set("page", String(page));
    return `/webhooks?${params.toString()}`;
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
