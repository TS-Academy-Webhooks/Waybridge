// features/events/components/event-filters.tsx
"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIPMENT_STATUSES, formatShipmentStatus } from "@/constants/shipment-status";

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateType(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("type");
    else params.set("type", value);
    params.delete("page");
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  }

  return (
    <Select defaultValue={searchParams.get("type") ?? "all"} onValueChange={updateType}>
      <SelectTrigger className="sm:w-56">
        <SelectValue placeholder="Event type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All event types</SelectItem>
        {SHIPMENT_STATUSES.map((status) => (
          <SelectItem key={status} value={`shipment.${status}`}>
            {formatShipmentStatus(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
