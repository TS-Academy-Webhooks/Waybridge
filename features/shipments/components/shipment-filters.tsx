// features/shipments/components/shipment-filters.tsx
"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIPMENT_STATUSES, formatShipmentStatus } from "@/constants/shipment-status";

export function ShipmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/shipments?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by tracking number or customer..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(event) => updateParams({ search: event.target.value })}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParams({ status: value === "all" ? null : value })}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {SHIPMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {formatShipmentStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
