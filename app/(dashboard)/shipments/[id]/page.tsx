import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { getShipment } from "@/lib/shipment-service";
import { ApiRequestError } from "@/lib/server-fetch";
import {
  SHIPMENT_STATUS_BADGE_VARIANT,
  formatShipmentStatus,
  type ShipmentStatus,
} from "@/constants/shipment-status";
import { ShipmentTimeline } from "@/features/tracking/shipment-timeline";
import { UpdateStatusDialog } from "@/features/shipments/components/update-status-dialog";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let shipment;
  try {
    shipment = await getShipment(id);
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }

  const status = shipment.status as ShipmentStatus;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {shipment.trackingNumber}
          </h1>
          <p className="text-muted-foreground">{shipment.customer}</p>
        </div>
        <UpdateStatusDialog shipmentId={shipment.id} currentStatus={status} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Details</CardTitle>
            <Badge variant={SHIPMENT_STATUS_BADGE_VARIANT[status] ?? "secondary"}>
              {formatShipmentStatus(shipment.status)}
            </Badge>
          </div>
          <CardDescription>Created {formatDate(shipment.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Origin</p>
            <p className="font-medium">{shipment.origin}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Destination</p>
            <p className="font-medium">{shipment.destination}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium">{shipment.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last update</p>
            <p className="font-medium">{formatDateTime(shipment.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentTimeline entries={shipment.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
