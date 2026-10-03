"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SignatureFilter = "true" | "false" | "unknown";

export function DemoReceiverFilters({
  eventValue,
  signatureValue,
}: {
  eventValue: string;
  signatureValue?: SignatureFilter;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState(eventValue);
  const [isPending, startTransition] = useTransition();

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/demo-receiver?${query}` : "/demo-receiver");
    });
  }

  function applyEventFilter(eventValueToApply: string) {
    updateParams({ event: eventValueToApply.trim() || null });
  }

  return (
    <form
      onSubmit={(formEvent) => {
        formEvent.preventDefault();
        applyEventFilter(event);
      }}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="receiver-event-filter">Event type</Label>
        <Input
          id="receiver-event-filter"
          value={event}
          maxLength={100}
          placeholder="shipment.created"
          onChange={(changeEvent) => setEvent(changeEvent.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receiver-signature-filter">Signature</Label>
        <Select
          value={signatureValue ?? "all"}
          onValueChange={(value) => {
            updateParams({
              event: event.trim() || null,
              signatureValid: value === "all" ? null : value,
            });
          }}
        >
          <SelectTrigger id="receiver-signature-filter" className="w-full sm:w-44">
            <SelectValue placeholder="All signatures" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All signatures</SelectItem>
            <SelectItem value="true">Valid</SelectItem>
            <SelectItem value="false">Invalid</SelectItem>
            <SelectItem value="unknown">Missing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Applying..." : "Apply"}
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Clear receiver filters"
          disabled={isPending || (!event && !signatureValue)}
          onClick={() => {
            setEvent("");
            updateParams({ event: null, signatureValid: null });
          }}
        >
          <FilterX />
          Clear
        </Button>
      </div>
    </form>
  );
}
