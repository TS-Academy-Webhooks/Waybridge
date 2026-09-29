// features/webhooks/components/webhook-status.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleWebhookAction } from "@/features/webhooks/webhook-actions";

export function WebhookStatus({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [optimisticActive, setOptimisticActive] = useOptimistic(isActive);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    startTransition(async () => {
      setOptimisticActive(next);
      const result = await toggleWebhookAction(id, next);
      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={optimisticActive}
        onCheckedChange={handleChange}
        aria-label={optimisticActive ? "Deactivate webhook" : "Activate webhook"}
      />
      <span className="text-sm text-muted-foreground">
        {optimisticActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
