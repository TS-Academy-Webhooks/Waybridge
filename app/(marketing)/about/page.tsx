import Link from "next/link";
import { ArrowRight, PackageSearch, ShieldCheck, Webhook as WebhookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteSiteUrl, createPageMetadata, SITE_NAME } from "@/lib/seo";

const ABOUT_DESCRIPTION =
  "Waybridge helps logistics and product teams keep shipment progress, customer visibility, and downstream systems connected.";

export const metadata = createPageMetadata({
  title: "Our approach to connected logistics",
  description: ABOUT_DESCRIPTION,
  path: "/about",
});

const aboutPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": absoluteSiteUrl("/about"),
  name: `About ${SITE_NAME}`,
  description: ABOUT_DESCRIPTION,
  url: absoluteSiteUrl("/about"),
  isPartOf: {
    "@id": absoluteSiteUrl("/#website"),
  },
  about: {
    "@id": absoluteSiteUrl("/#software"),
  },
};

const PILLARS = [
  {
    icon: PackageSearch,
    title: "A clearer picture of movement",
    description:
      "Keep shipment status and its timeline together, so the next hand-off starts with context instead of guesswork.",
  },
  {
    icon: WebhookIcon,
    title: "Signals that travel further",
    description:
      "Turn meaningful shipment changes into updates that can reach the systems and people waiting for them.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence across hand-offs",
    description:
      "Give teams a place to understand what happened, what was delivered, and where attention is needed next.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={aboutPageStructuredData} />

      <section className="grid gap-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/[0.08] via-background to-muted/60 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            About Waybridge
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Logistics moves better when every hand-off is connected.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Waybridge brings shipment progress and the systems around it into
            one clearer flow. Operations teams can see how a delivery is moving;
            customers and connected tools can stay informed as it changes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/track">
                Track a shipment
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">Explore the API docs</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex flex-col items-start gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <PackageSearch aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">One connected journey</p>
                <p className="text-sm text-muted-foreground">From pickup to delivery</p>
              </div>
            </div>
            <span className="self-start rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success sm:self-auto">
              In motion
            </span>
          </div>
          <ol className="space-y-5 pt-5">
            <li className="flex gap-3">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="font-medium">A shipment moves</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Each status adds context to the delivery timeline.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary/60" />
              <div>
                <p className="font-medium">The right people get a signal</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A meaningful change can travel to connected systems.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-muted-foreground/40" />
              <div>
                <p className="font-medium">The outcome stays visible</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Teams can understand the hand-off and what happened next.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Why Waybridge
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Less chasing updates. More useful context.
          </h2>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <p className="leading-7">
            A delivery touches more than one team. When shipment status, customer
            visibility, and internal tools drift apart, people spend time asking
            where things stand instead of acting on what comes next.
          </p>
          <p className="leading-7">
            Waybridge is designed to keep those moments connected: one shipment
            timeline for understanding progress, and clear signals that help
            downstream systems respond to change.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            What we value
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Built around the moments that matter.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <CardTitle className="mt-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl bg-muted/40 p-6 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            One journey, shared clearly
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Useful to the people on every side of a delivery.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-background p-5">
            <h3 className="font-semibold">For operations teams</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Maintain shipment context, understand status changes, and see
              whether an update reached a connected destination.
            </p>
          </div>
          <div className="rounded-2xl border bg-background p-5">
            <h3 className="font-semibold">For customers and builders</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Follow a shipment without an account or connect event updates to
              the tools your team already uses.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Keep the next update moving.
          </h2>
          <p className="text-muted-foreground">
            See the customer experience or explore how Waybridge connects to your systems.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/track">Track a shipment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">
              Read the API guide
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
