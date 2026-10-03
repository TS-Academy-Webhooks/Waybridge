// features/events/components/event-table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function EventTableSkeleton() {
  return (
    <>
      <div className="grid gap-3 xl:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-md border p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-4 h-4 w-24" />
          </div>
        ))}
      </div>
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
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
