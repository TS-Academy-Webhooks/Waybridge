// features/events/components/event-filters.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isEventType } from "@/constants/event-types";
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
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const currentType = searchParams.get("type") ?? undefined;

  function updateSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");
    params.delete("page");
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  }

  function updateType(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !isEventType(value)) params.delete("type");
    else params.set("type", value);
    params.delete("page");
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select defaultValue={isEventType(currentType) ? currentType : "all"} onValueChange={updateType}>
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="Event type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All event types</SelectItem>
          <SelectItem value="webhook.test">Webhook test</SelectItem>
          {SHIPMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={`shipment.${status}`}>
              {formatShipmentStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <form onSubmit={updateSearch} className="flex gap-2">
        <Input
          aria-label="Search event IDs"
          placeholder="Search event IDs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          maxLength={100}
        />
        <Button type="submit" variant="outline" aria-label="Search events">
          <Search />
        </Button>
      </form>
    </div>
  );
}
