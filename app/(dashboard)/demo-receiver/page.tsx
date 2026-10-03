import Link from "next/link";
import { Info } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoReceiverConfigForm } from "@/features/demo-receiver/components/demo-receiver-config-form";
import { DemoReceiverFilters } from "@/features/demo-receiver/components/demo-receiver-filters";
import { DemoReceiverHistory } from "@/features/demo-receiver/components/demo-receiver-history";
import { CopyValue } from "@/features/dashboard/components/copy-value";
import { ApiRequestError } from "@/lib/server-fetch";
import { getDemoReceiverConfiguration, getDemoReceiverHistory } from "@/lib/demo-receiver-service";
import { getCurrentUser } from "@/lib/dal";
import { DEMO_RECEIVER_URL } from "@/lib/api-config";

const SIGNATURE_FILTERS = ["true", "false", "unknown"] as const;

export default async function DemoReceiverPage({
  searchParams,
}: {
  searchParams: Promise<{
    event?: string;
    signatureValid?: string;
    page?: string;
  }>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const isAdmin = user?.role === "admin";
  const pageNumber = Number(params.page);
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const event = params.event?.trim().slice(0, 100) || undefined;
  const signatureValid = SIGNATURE_FILTERS.find(
    (value) => value === params.signatureValid
  );

  let history: Awaited<ReturnType<typeof getDemoReceiverHistory>> | null = null;
  let configuration: Awaited<ReturnType<typeof getDemoReceiverConfiguration>> | null = null;
  let loadError: ApiRequestError | null = null;

  if (isAdmin) {
    try {
      [history, configuration] = await Promise.all([
        getDemoReceiverHistory({ page, limit: 20, event, signatureValid }),
        getDemoReceiverConfiguration(),
      ]);
    } catch (error) {
      if (error instanceof ApiRequestError) loadError = error;
      else throw error;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Demo Receiver</h1>
        <p className="text-muted-foreground">
          Inspect webhook requests and configure test responses without standing up your own server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receiver URL</CardTitle>
          <CardDescription>
            Use this public POST endpoint as a webhook URL. Add <code>/fail</code> to test
            failure handling.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <CopyValue value={DEMO_RECEIVER_URL} />
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/webhooks/new">Create a test webhook</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/deliveries">View deliveries</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info />
        <AlertTitle>Test workflow</AlertTitle>
        <AlertDescription>
          Create an active webhook with this URL, then send a shipment event or use
          &ldquo;Send test event&rdquo; from its details page. Refresh request history below to
          inspect the payload and signature result. In production, the backend must be started
          with <code className="mx-1 font-mono">ENABLE_DEMO_RECEIVER=true</code>.
        </AlertDescription>
      </Alert>

      {!isAdmin ? (
        <Alert>
          <Info />
          <AlertTitle>Admin access required</AlertTitle>
          <AlertDescription>
            Webhook deliveries can still be sent to the public receiver URL. Only admins can
            inspect captured requests, clear history, or change response profiles; view your
            delivery status on the Deliveries page.
          </AlertDescription>
        </Alert>
      ) : loadError ? (
        <Alert>
          <Info />
          <AlertTitle>Unable to load receiver controls</AlertTitle>
          <AlertDescription>
            {loadError.message}
            {loadError.status === 404
              ? " If the backend is running in production, enable it with ENABLE_DEMO_RECEIVER=true."
              : ""}
          </AlertDescription>
        </Alert>
      ) : history && configuration ? (
        <>
          <DemoReceiverConfigForm
            key={JSON.stringify(configuration)}
            configuration={configuration}
          />
          <DemoReceiverFilters
            key={`${event ?? ""}-${signatureValid ?? ""}`}
            eventValue={event ?? ""}
            signatureValue={signatureValid}
          />
          <DemoReceiverHistory
            requests={history.items}
            pagination={history.pagination}
            filters={{ event, signatureValid }}
          />
        </>
      ) : null}
    </div>
  );
}
