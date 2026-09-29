import Link from "next/link";
import {
  ArrowRight,
  PackageSearch,
  ShieldCheck,
  Webhook as WebhookIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: PackageSearch,
    title: "Real-time shipment tracking",
    description:
      "Follow a shipment through every stage of its lifecycle — from creation to delivery — with a full timeline history.",
  },
  {
    icon: WebhookIcon,
    title: "Reliable webhook delivery",
    description:
      "Subscribe endpoints to shipment events and get signed, retried deliveries with a complete attempt log.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Signed webhook payloads, scoped API access, and session-based authentication keep your integrations safe.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-20">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Logistics tracking and webhook delivery, in one platform
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Waybridge lets your team manage shipments end-to-end and notify
          downstream systems the moment a shipment&apos;s status changes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/track">
              Track a shipment
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Create an account</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="size-6 text-primary" />
              <CardTitle className="mt-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
