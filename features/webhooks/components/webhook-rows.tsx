// features/webhooks/components/webhook-rows.tsx
"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import type { Webhook } from "@/lib/webhook-service";
import { EventBadges } from "@/features/webhooks/components/event-badges";
import { WebhookStatus } from "@/features/webhooks/components/webhook-status";
import { DeleteWebhookDialog } from "@/features/webhooks/components/delete-webhook-dialog";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
};

export function WebhookRows({ items }: { items: Webhook[] }) {
  return (
    <motion.tbody
      data-slot="table-body"
      className="[&_tr:last-child]:border-0"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {items.map((webhook) => (
          <motion.tr
            key={webhook.id}
            variants={row}
            className="border-b transition-colors last:border-0 hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <Link href={`/webhooks/${webhook.id}`} className="hover:underline">
                {webhook.name}
              </Link>
            </TableCell>
            <TableCell className="max-w-56 truncate font-mono text-sm text-muted-foreground">
              {webhook.url}
            </TableCell>
            <TableCell>
              <EventBadges events={webhook.events} />
            </TableCell>
            <TableCell>
              <WebhookStatus id={webhook.id} isActive={webhook.isActive} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(webhook.createdAt)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button asChild variant="outline" size="icon" aria-label="Edit webhook">
                  <Link href={`/webhooks/${webhook.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <DeleteWebhookDialog id={webhook.id} name={webhook.name} />
              </div>
            </TableCell>
          </motion.tr>
        ))}
    </motion.tbody>
  );
}
