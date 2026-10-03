import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DemoReceiverAdminActions } from "@/features/demo-receiver/components/demo-receiver-admin-actions";
import { formatDateTime } from "@/lib/format-date";
import type {
  DemoReceiverRequest,
  DemoReceiverHistoryParams,
} from "@/lib/demo-receiver-service";
import type { Pagination } from "@/lib/webhook-service";

function signatureLabel(request: DemoReceiverRequest): string {
  if (request.signatureValid === true) return "Valid";
  if (request.signatureValid === false) return "Invalid";
  return "Missing";
}

function signatureVariant(request: DemoReceiverRequest): "default" | "destructive" | "secondary" {
  if (request.signatureValid === true) return "default";
  if (request.signatureValid === false) return "destructive";
  return "secondary";
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? "(empty)";
}

export function DemoReceiverHistory({
  requests,
  pagination,
  filters,
}: {
  requests: DemoReceiverRequest[];
  pagination: Pagination;
  filters: Pick<DemoReceiverHistoryParams, "event" | "signatureValid">;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Received requests</CardTitle>
        <CardDescription>
          Latest requests captured by this backend. Signature and sensitive headers are shown
          without exposing the original signature or credentials.
        </CardDescription>
        <CardAction>
          <DemoReceiverAdminActions />
        </CardAction>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="rounded-md border border-dashed py-14 text-center text-sm text-muted-foreground">
            No requests match these filters. Send a test event or clear the filters.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Received</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Request details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request, index) => (
                    <TableRow key={`${request.timestamp}-${index}`}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(request.timestamp)}
                      </TableCell>
                      <TableCell>
                        {request.eventType ? (
                          <code className="text-xs">{request.eventType}</code>
                        ) : (
                          <span className="text-muted-foreground">Unknown event</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={signatureVariant(request)}>
                            {signatureLabel(request)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {request.signature.scheme ?? "No scheme"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <details className="min-w-48">
                          <summary className="cursor-pointer text-sm underline underline-offset-4">
                            Inspect request
                          </summary>
                          <div className="mt-3 flex max-w-3xl flex-col gap-3">
                            <p className="text-xs text-muted-foreground">
                              Verification: {request.signature.status}
                              {request.signature.timestampFresh === null
                                ? " · no timestamp"
                                : request.signature.timestampFresh
                                  ? " · timestamp fresh"
                                  : " · timestamp stale"}
                              {request.bodyTruncated ? " · body preview truncated at 64 KiB" : ""}
                            </p>
                            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs">
                              {formatJson({
                                headers: request.headers,
                                body: request.body,
                                rawBody: request.rawBody,
                                signature: request.signature,
                              })}
                            </pre>
                          </div>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationBar pagination={pagination} filters={filters} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaginationBar({
  pagination,
  filters,
}: {
  pagination: Pagination;
  filters: Pick<DemoReceiverHistoryParams, "event" | "signatureValid">;
}) {
  if (pagination.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    if (filters.event) params.set("event", filters.event);
    if (filters.signatureValid) params.set("signatureValid", filters.signatureValid);
    params.set("page", String(page));
    return `/demo-receiver?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} request(s)
      </span>
      <div className="flex gap-2">
        {pagination.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(pagination.page - 1)}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>Previous</Button>
        )}
        {pagination.page < pagination.totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(pagination.page + 1)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>Next</Button>
        )}
      </div>
    </div>
  );
}
