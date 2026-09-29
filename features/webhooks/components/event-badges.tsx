// features/webhooks/components/event-badges.tsx
import { Badge } from "@/components/ui/badge";
import { formatEventType } from "@/lib/format-event-type";

const MAX_VISIBLE = 3;

export function EventBadges({ events }: { events: string[] }) {
  if (events.length === 0) {
    return <span className="text-sm text-muted-foreground">No events</span>;
  }

  const visible = events.slice(0, MAX_VISIBLE);
  const remaining = events.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((event) => (
        <Badge key={event} variant="secondary">
          {event === "*" ? "All events" : formatEventType(event)}
        </Badge>
      ))}
      {remaining > 0 && <Badge variant="outline">+{remaining} more</Badge>}
    </div>
  );
}
