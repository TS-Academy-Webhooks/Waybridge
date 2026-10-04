import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="text-6xl font-semibold tracking-tight text-primary">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          This dashboard page isn&apos;t available
        </h1>
        <p className="max-w-md text-muted-foreground">
          The page may have moved, or the requested record may no longer exist.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
