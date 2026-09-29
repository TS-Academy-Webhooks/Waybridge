// features/deliveries/components/delivery-attempts.tsx
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
import { DELIVERY_STATUS_BADGE_VARIANT } from "@/constants/delivery-status";
import type { DeliveryAttempt } from "@/lib/delivery-service";

export function DeliveryAttempts({ attempts }: { attempts: DeliveryAttempt[] }) {
  if (attempts.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        No attempts recorded yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Status code</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((attempt) => (
            <TableRow key={attempt.id}>
              <TableCell className="text-muted-foreground">{attempt.attemptNumber}</TableCell>
              <TableCell>
                <Badge variant={DELIVERY_STATUS_BADGE_VARIANT[attempt.status]}>
                  {attempt.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {attempt.statusCode ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {attempt.durationMs != null ? `${attempt.durationMs}ms` : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(attempt.createdAt)}
              </TableCell>
              <TableCell className="max-w-64 truncate text-sm text-muted-foreground">
                {attempt.errorMessage ?? attempt.responseBody ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
