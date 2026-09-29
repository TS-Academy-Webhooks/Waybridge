export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-20">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">About Waybridge</h1>
        <p className="mt-4 text-muted-foreground">
          Waybridge is a logistics management platform that connects shipment
          tracking with reliable, signed webhook delivery. Teams use it to
          keep their own systems, and their customers, informed the moment a
          shipment moves.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="flex flex-col gap-3 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1. Create shipments —</span>{" "}
            record shipment details and get a unique tracking number.
          </li>
          <li>
            <span className="font-medium text-foreground">2. Update status —</span>{" "}
            move a shipment through its lifecycle, from creation to delivery.
          </li>
          <li>
            <span className="font-medium text-foreground">3. Subscribe webhooks —</span>{" "}
            register an endpoint and choose which shipment events to receive.
          </li>
          <li>
            <span className="font-medium text-foreground">4. Get notified —</span>{" "}
            every status change is delivered to your endpoint with a signed
            payload and automatic retries.
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">For customers</h2>
        <p className="text-muted-foreground">
          Anyone with a tracking number can check a shipment&apos;s status —
          no account required — from the public tracking page.
        </p>
      </div>
    </div>
  );
}
