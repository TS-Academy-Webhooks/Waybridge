// features/tracking/shipment-timeline.tsx
// Reusable vertical timeline — used on the public tracking page and later
// on the authenticated Shipment Details page (Track C).
import { CheckCircle2, Circle } from "lucide-react";
import { formatDateTime } from "@/lib/format-date";
import { formatShipmentStatus } from "@/constants/shipment-status";

export type TimelineEntry = {
  status: string;
  at: string;
  timestamp?: string;
  note?: string | null;
};

export function ShipmentTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status history yet.</p>
    );
  }

  // Backend returns entries chronologically (oldest first); display most
  // recent status first so the top of the timeline is "where things stand".
  const ordered = [...entries].reverse();

  return (
    <ol className="flex flex-col gap-6">
      {ordered.map((entry, index) => {
        const isLast = index === ordered.length - 1;
        const isCurrent = index === 0;
          const at = entry.at ?? entry.timestamp ?? "";
          return (
            <li key={`${entry.status}-${at}`} className="relative flex gap-3 pb-0">
            <div className="flex flex-col items-center">
              {isCurrent ? (
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground" />
              )}
              {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="flex flex-col gap-0.5 pb-6">
              <span className="font-medium">{formatShipmentStatus(entry.status)}</span>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(at)}
              </span>
              {entry.note ? (
                <span className="text-sm text-muted-foreground">{entry.note}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
