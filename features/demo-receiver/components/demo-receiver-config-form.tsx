"use client";

import { useState, useTransition, type FormEvent } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  resetDemoReceiverConfigurationAction,
  updateDemoReceiverConfigurationAction,
} from "@/features/demo-receiver/demo-receiver-actions";
import type {
  DemoReceiverConfiguration,
  JsonValue,
} from "@/lib/demo-receiver-service";

function initialBody(profileBody: JsonValue | undefined): string {
  return profileBody === undefined ? "" : JSON.stringify(profileBody, null, 2) ?? "";
}

export function DemoReceiverConfigForm({
  configuration,
}: {
  configuration: DemoReceiverConfiguration;
}) {
  const [successStatus, setSuccessStatus] = useState(String(configuration.success.statusCode));
  const [failureStatus, setFailureStatus] = useState(String(configuration.failure.statusCode));
  const [successBody, setSuccessBody] = useState(initialBody(configuration.success.body));
  const [failureBody, setFailureBody] = useState(initialBody(configuration.failure.body));
  const [isPending, startTransition] = useTransition();

  function parseOptionalBody(value: string, label: string): { present: boolean; value?: unknown } | null {
    if (!value.trim()) return { present: false };
    try {
      const parsed: unknown = JSON.parse(value);
      return { present: true, value: parsed };
    } catch {
      toast.error(`${label} response body must be valid JSON`);
      return null;
    }
  }

  function saveConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedSuccessBody = parseOptionalBody(successBody, "Success");
    if (!parsedSuccessBody) return;
    const parsedFailureBody = parseOptionalBody(failureBody, "Failure");
    if (!parsedFailureBody) return;

    const successProfile: { statusCode: number; body?: unknown } = {
      statusCode: Number(successStatus),
    };
    const failureProfile: { statusCode: number; body?: unknown } = {
      statusCode: Number(failureStatus),
    };
    if (parsedSuccessBody.present) successProfile.body = parsedSuccessBody.value;
    if (parsedFailureBody.present) failureProfile.body = parsedFailureBody.value;

    startTransition(async () => {
      const result = await updateDemoReceiverConfigurationAction({
        success: successProfile,
        failure: failureProfile,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Receiver responses updated");
    });
  }

  function restoreDefaults() {
    startTransition(async () => {
      const result = await resetDemoReceiverConfigurationAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Default receiver responses restored");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response behavior</CardTitle>
        <CardDescription>
          Choose the HTTP response for the success URL and the <code>/fail</code> test URL.
          Success codes must be 2xx; failure codes must be 4xx or 5xx.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={saveConfiguration} className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-3">
              <h3 className="font-medium">Success response</h3>
              <div className="space-y-2">
                <Label htmlFor="success-status">HTTP status</Label>
                <Input
                  id="success-status"
                  type="number"
                  min={200}
                  max={299}
                  step={1}
                  value={successStatus}
                  onChange={(event) => setSuccessStatus(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-body">JSON response body</Label>
                <Textarea
                  id="success-body"
                  value={successBody}
                  onChange={(event) => setSuccessBody(event.target.value)}
                  placeholder="Leave blank to use the backend's default success envelope."
                  className="min-h-32 font-mono text-xs"
                />
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="font-medium">Failure response</h3>
              <div className="space-y-2">
                <Label htmlFor="failure-status">HTTP status</Label>
                <Input
                  id="failure-status"
                  type="number"
                  min={400}
                  max={599}
                  step={1}
                  value={failureStatus}
                  onChange={(event) => setFailureStatus(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="failure-body">JSON response body</Label>
                <Textarea
                  id="failure-body"
                  value={failureBody}
                  onChange={(event) => setFailureBody(event.target.value)}
                  placeholder="Enter JSON, or leave blank to keep the current body."
                  className="min-h-32 font-mono text-xs"
                />
              </div>
            </section>
          </div>
          <p className="text-xs text-muted-foreground">
            Blank bodies keep their current behavior. Use Restore defaults to remove custom bodies
            and restore both backend profiles.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={restoreDefaults}
            >
              <RotateCcw />
              Restore defaults
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save />
              {isPending ? "Saving..." : "Save responses"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
