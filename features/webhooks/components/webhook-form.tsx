// features/webhooks/components/webhook-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EventSelector } from "@/features/webhooks/components/event-selector";
import { SecretField } from "@/features/webhooks/components/secret-field";
import {
  createWebhookAction,
  updateWebhookAction,
} from "@/features/webhooks/webhook-actions";
import {
  webhookFormDefaults,
  webhookFormSchema,
  type WebhookFormValues,
} from "@/lib/validate-webhook";

type WebhookFormProps = (
  | { mode: "create"; webhookId?: never; defaultValues?: never }
  | {
      mode: "edit";
      webhookId: string;
      defaultValues: WebhookFormValues;
    }
) & { demoReceiverUrl: string };

export function WebhookForm(props: WebhookFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [regenerateSecret, setRegenerateSecret] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: props.mode === "edit" ? props.defaultValues : webhookFormDefaults,
  });

  function onSubmit(values: WebhookFormValues) {
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createWebhookAction(values)
          : await updateWebhookAction(props.webhookId, values, regenerateSecret);

      if (!result.success) {
        toast.error(result.message);
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          form.setError(field as keyof WebhookFormValues, { message });
        }
        return;
      }

      toast.success(props.mode === "create" ? "Webhook created" : "Webhook updated");

      // The secret is only returned in full on create, or on update when
      // regenerateSecret was requested — surface it once since it can't be
      // retrieved again afterwards.
      if (props.mode === "create" || regenerateSecret) {
        setCreatedId(result.data.id);
        setRevealedSecret(result.data.secret);
        return;
      }

      router.push(`/webhooks/${props.webhookId}`);
    });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Order fulfillment notifier" maxLength={80} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Endpoint URL</FormLabel>
                  <button
                    type="button"
                    onClick={() => field.onChange(props.demoReceiverUrl)}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Use Demo Receiver
                  </button>
                </div>
                <FormControl>
                  <Input placeholder="https://example.com/webhooks/shipments" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="events"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Events</FormLabel>
                <FormControl>
                  <EventSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                <div className="flex flex-col gap-0.5">
                  <FormLabel>Active</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Inactive webhooks stop receiving deliveries.
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          {props.mode === "edit" && (
            <div className="flex flex-row items-center justify-between rounded-md border p-3">
              <div className="flex flex-col gap-0.5">
                <Label>Regenerate secret</Label>
                <p className="text-sm text-muted-foreground">
                  Issues a new signing secret and invalidates the old one.
                </p>
              </div>
              <Switch checked={regenerateSecret} onCheckedChange={setRegenerateSecret} />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : props.mode === "create"
                  ? "Create webhook"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog
        open={revealedSecret !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevealedSecret(null);
            router.push(`/webhooks/${createdId ?? props.webhookId ?? ""}`);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signing secret</DialogTitle>
            <DialogDescription>
              Copy this now — it won&apos;t be shown again. Use it to verify the{" "}
              <code className="font-mono">X-Webhook-Signature</code> header on
              incoming deliveries.
            </DialogDescription>
          </DialogHeader>
          {revealedSecret && <SecretField secret={revealedSecret} />}
          <DialogFooter>
            <Button
              onClick={() => {
                setRevealedSecret(null);
                router.push(`/webhooks/${createdId ?? props.webhookId ?? ""}`);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
