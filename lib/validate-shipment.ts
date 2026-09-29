// lib/validate-shipment.ts
// Mirrors backend-my-part's inline validation in shipment.controller.js
// createShipment (customer >= 2 chars, origin/destination required,
// amount > 0).
import { z } from "zod";

export const shipmentFormSchema = z.object({
  customer: z.string().trim().min(2, "Customer name is required"),
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
