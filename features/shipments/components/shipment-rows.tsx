// features/shipments/components/shipment-rows.tsx
"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import {
  SHIPMENT_STATUS_BADGE_VARIANT,
  formatShipmentStatus,
  type ShipmentStatus,
} from "@/constants/shipment-status";
import type { Shipment } from "@/lib/shipment-service";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
};

export function ShipmentRows({ items }: { items: Shipment[] }) {
  return (
    <motion.tbody
      data-slot="table-body"
      className="[&_tr:last-child]:border-0"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {items.map((shipment) => (
        <motion.tr
          key={shipment.id}
          variants={row}
          className="border-b transition-colors last:border-0 hover:bg-muted/50"
        >
          <TableCell className="font-mono font-medium">
            <Link href={`/shipments/${shipment.id}`} className="hover:underline">
              {shipment.trackingNumber}
            </Link>
          </TableCell>
          <TableCell>{shipment.customer}</TableCell>
          <TableCell className="text-muted-foreground">{shipment.origin}</TableCell>
          <TableCell className="text-muted-foreground">{shipment.destination}</TableCell>
          <TableCell>
            <Badge variant={SHIPMENT_STATUS_BADGE_VARIANT[shipment.status as ShipmentStatus] ?? "secondary"}>
              {formatShipmentStatus(shipment.status)}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {formatDate(shipment.createdAt)}
          </TableCell>
        </motion.tr>
      ))}
    </motion.tbody>
  );
}
