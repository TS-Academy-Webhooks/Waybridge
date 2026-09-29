import Link from "next/link";
import { Info } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyValue } from "@/features/dashboard/components/copy-value";
import { DEMO_RECEIVER_URL } from "@/lib/api-config";

export default function DemoReceiverPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Demo receiver</h1>
        <p className="text-muted-foreground">
          A ready-made endpoint for testing webhook deliveries without
          standing up your own server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receiver URL</CardTitle>
          <CardDescription>
            Paste this into a webhook&apos;s endpoint URL, or use the
            &quot;Use Demo Receiver&quot; shortcut on the webhook form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CopyValue value={DEMO_RECEIVER_URL} />
        </CardContent>
      </Card>

      <Alert>
        <Info />
        <AlertTitle>Backend support pending</AlertTitle>
        <AlertDescription>
          This endpoint isn&apos;t implemented in the current backend yet, so
          deliveries sent to it will fail until the corresponding
          <code className="mx-1 font-mono">demo-receiver.controller.js</code>
          and <code className="mx-1 font-mono">demo-receiver.routes.js</code>
          are added. Once available, this page can be extended to poll for and
          display the last few payloads it received.
        </AlertDescription>
      </Alert>

      <div>
        <Button asChild variant="outline">
          <Link href="/webhooks/new">Create a test webhook</Link>
        </Button>
      </div>
    </div>
  );
}
