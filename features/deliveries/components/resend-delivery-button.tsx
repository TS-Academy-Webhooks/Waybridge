// features/deliveries/components/resend-delivery-button.tsx
"use client";

import { useTransition } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resendDeliveryAction } from "@/features/deliveries/delivery-actions";

export function ResendDeliveryButton({ deliveryId }: { deliveryId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleResend() {
    startTransition(async () => {
      const result = await resendDeliveryAction(deliveryId);
      if (result.success) {
        toast.success("Delivery queued for redelivery.");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={isPending}
    >
      <RotateCw className={isPending ? "animate-spin" : ""} />
      Resend
    </Button>
  );
}
