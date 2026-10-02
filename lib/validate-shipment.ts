// lib/validate-shipment.ts
// Mirrors waybridge-be's createShipment validation (customer name optional
// for customers, origin/destination required, amount > 0).
import { z } from "zod";

export const shipmentFormSchema = z.object({
  customer: z.string().trim().refine((v) => v === "" || v.length >= 2, "Customer name must be at least 2 characters"),
  origin: z.string().trim().min(1, "Origin is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  amount: z.number({ error: "Amount is required" }).gt(0, "Amount must be greater than 0"),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

export const shipmentFormDefaults: ShipmentFormValues = {
  customer: "",
  origin: "",
  destination: "",
  amount: 0,
};
