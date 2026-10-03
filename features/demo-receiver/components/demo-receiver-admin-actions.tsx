"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clearDemoReceiverHistoryAction } from "@/features/demo-receiver/demo-receiver-actions";

export function DemoReceiverAdminActions() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function clearHistory() {
    startTransition(async () => {
      const result = await clearDemoReceiverHistoryAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(`${result.data.clearedCount} received request(s) cleared`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => router.refresh()}
      >
        <RefreshCw />
        Refresh requests
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" disabled={isPending}>
            <Trash2 />
            Clear history
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear received requests?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the in-memory Demo Receiver history for every admin.
              It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                clearHistory();
              }}
            >
              {isPending ? "Clearing..." : "Clear history"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
