// constants/delivery-status.ts
export const DELIVERY_STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  success: "default",
  pending: "secondary",
  failed: "destructive",
};
