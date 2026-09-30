"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, PackageSearch, SearchX, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format-date";
import {
  SHIPMENT_STATUS_BADGE_VARIANT,
  formatShipmentStatus,
  type ShipmentStatus,
} from "@/constants/shipment-status";
import { ShipmentTimeline } from "@/features/tracking/shipment-timeline";
import { trackShipmentFormAction, type TrackResult } from "@/features/tracking/tracking-actions";
import type { TrackedShipment } from "@/features/tracking/tracking-service";

type TrackState = { status: "idle" } | TrackResult;

export default function TrackPage() {
  const [state, setState] = useState<TrackState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await trackShipmentFormAction(formData);
      setState(result);
    });
  }

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Track your shipment</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your tracking number to see its current status and history.
        </p>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="trackingNumber" className="sr-only">
            Tracking number
          </Label>
          <Input
            id="trackingNumber"
            name="trackingNumber"
            placeholder="TRK-00001"
            autoComplete="off"
            className="font-mono"
            required
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Searching..." : "Track"}
        </Button>
      </form>

      {state.status === "invalid" && (
        <StateMessage icon={AlertTriangle} title="Invalid tracking number">
          {state.message}
        </StateMessage>
      )}
      {state.status === "not_found" && (
        <StateMessage icon={SearchX} title="Shipment not found">
          We couldn&apos;t find a shipment with that tracking number. Double-check
          it and try again.
        </StateMessage>
      )}
      {state.status === "error" && (
        <StateMessage icon={WifiOff} title="Something went wrong">
          {state.message}
        </StateMessage>
      )}
      {state.status === "success" && (
        <ShipmentResult shipment={state.shipment} />
      )}

      <p className="text-center text-sm text-muted-foreground">
        Need to manage shipments and webhooks?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function ShipmentResult({ shipment }: { shipment: TrackedShipment }) {
  const status = shipment.status as ShipmentStatus;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono">{shipment.trackingNumber}</CardTitle>
          <Badge variant={SHIPMENT_STATUS_BADGE_VARIANT[status] ?? "secondary"}>
            {formatShipmentStatus(shipment.status)}
          </Badge>
        </div>
        <CardDescription>
          Last update {formatDateTime(shipment.lastUpdate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Origin</p>
            <p className="font-medium">{shipment.origin}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Destination</p>
            <p className="font-medium">{shipment.destination}</p>
          </div>
        </div>
        <ShipmentTimeline entries={shipment.timeline} />
      </CardContent>
    </Card>
  );
}

function StateMessage({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof PackageSearch;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
