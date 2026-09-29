import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebhookFilters } from "@/features/webhooks/components/webhook-filters";
import { WebhookTable } from "@/features/webhooks/components/webhook-table";
import { WebhookTableSkeleton } from "@/features/webhooks/components/webhook-table-skeleton";

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; isActive?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">
            Manage endpoints that receive shipment event notifications.
          </p>
        </div>
        <Button asChild>
          <Link href="/webhooks/new">
            <Plus />
            New webhook
          </Link>
        </Button>
      </div>
      <WebhookFilters />
      <Suspense
        key={`${params.search ?? ""}-${params.isActive ?? ""}-${params.page ?? ""}`}
        fallback={<WebhookTableSkeleton />}
      >
        <WebhookTable search={params.search} isActive={params.isActive} page={page} />
      </Suspense>
    </div>
  );
}
