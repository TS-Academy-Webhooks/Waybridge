import { ShipmentForm } from "@/features/shipments/components/shipment-form";
import { getCurrentUser } from "@/lib/dal";

export default async function NewShipmentPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New shipment</h1>
        <p className="text-muted-foreground">
          Create a shipment and get a tracking number for it.
        </p>
      </div>
      <ShipmentForm isAdmin={user?.role === "admin"} />
    </div>
  );
}
