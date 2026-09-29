// features/webhooks/components/test-webhook-button.tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { testWebhookAction } from "@/features/webhooks/webhook-actions";

export function TestWebhookButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await testWebhookAction(id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Test delivery queued");
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      <Send />
      {isPending ? "Sending..." : "Send test event"}
    </Button>
  );
}
