// features/shipments/components/update-status-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateShipmentStatusAction } from "@/features/shipments/shipment-actions";
import {
  VALID_TRANSITIONS,
  formatShipmentStatus,
  type ShipmentStatus,
} from "@/constants/shipment-status";

export function UpdateStatusDialog({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const [open, setOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ShipmentStatus | "">("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const options = VALID_TRANSITIONS[currentStatus] ?? [];

  function handleSubmit() {
    if (!nextStatus) return;
    startTransition(async () => {
      const result = await updateShipmentStatusAction(
        shipmentId,
        currentStatus,
        nextStatus,
        note || undefined
      );
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Shipment status updated");
      setOpen(false);
      setNextStatus("");
      setNote("");
    });
  }

  if (options.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRightCircle />
          Update status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update shipment status</DialogTitle>
          <DialogDescription>
            Currently <strong>{formatShipmentStatus(currentStatus)}</strong>. Choose the
            next stage in its lifecycle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as ShipmentStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select next status" />
            </SelectTrigger>
            <SelectContent>
              {options.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatShipmentStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Optional note (e.g. carrier, delay reason)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!nextStatus || isPending}>
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
