// features/deliveries/components/delivery-table.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format-date";
import { getDeliveries } from "@/lib/delivery-service";
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";
import { getPropertyOrValue } from "@/lib/utils";
import { ResendDeliveryButton } from "./resend-delivery-button";

export async function DeliveryTable({
  status,
  page,
}: {
  status?: string;
  page?: number;
}) {
  const { items, pagination } = await getDeliveries({
    status: status as "pending" | "success" | "failed" | undefined,
    page,
    limit: 15,
  });

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-16 text-center text-sm text-muted-foreground">
        No deliveries yet. Deliveries appear here once a webhook is triggered
        by a shipment event.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 xl:hidden">
        {items.map((delivery) => (
          <li key={delivery.id} className="rounded-md border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Webhook</p>
                <Link
                  href={`/deliveries/${delivery.id}`}
                  className="break-words font-medium hover:underline"
                >
                  {getPropertyOrValue(delivery.webhook, "name") ?? "Deleted webhook"}
                </Link>
              </div>
              <Badge
                variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status]}
                className="shrink-0"
              >
                {delivery.status}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Attempts</dt>
                <dd className="mt-1 text-muted-foreground">
                  {delivery.attemptCount}/{delivery.maxAttempts}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Last attempt</dt>
                <dd className="mt-1 break-words text-muted-foreground">
                  {formatDateTime(delivery.lastAttemptAt)}
                </dd>
              </div>
            </dl>
            {delivery.status === "failed" ? (
              <div className="mt-3 flex justify-end">
                <ResendDeliveryButton deliveryId={delivery.id} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="hidden rounded-md border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Webhook</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Last attempt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>
                  <Link href={`/deliveries/${delivery.id}`} className="hover:underline">
                    {getPropertyOrValue(delivery.webhook, "name") ?? "Deleted webhook"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[delivery.status]}>
                    {delivery.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {delivery.attemptCount}/{delivery.maxAttempts}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(delivery.lastAttemptAt)}
                </TableCell>
                <TableCell className="text-right">
                  {delivery.status === "failed" ? (
                    <ResendDeliveryButton deliveryId={delivery.id} />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationBar pagination={pagination} status={status} />
    </div>
  );
}

function PaginationBar({
  pagination,
  status,
}: {
  pagination: { page: number; totalPages: number };
  status?: string;
}) {
  if (pagination.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    return `/deliveries?${params.toString()}`;
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
