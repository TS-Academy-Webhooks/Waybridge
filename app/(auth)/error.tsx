"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message || "We couldn't process that request. Please try again."}
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
