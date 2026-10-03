import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, absoluteSiteUrl } from "@/lib/seo";

const TRACKING_DESCRIPTION =
  "Check the latest status and timeline for a shipment using its tracking number, with no account required.";

export const metadata = createPageMetadata({
  title: "Track a shipment",
  description: TRACKING_DESCRIPTION,
  path: "/track",
});

const trackingPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": absoluteSiteUrl("/track"),
  name: "Track a shipment | Waybridge",
  description: TRACKING_DESCRIPTION,
  url: absoluteSiteUrl("/track"),
  isPartOf: {
    "@id": absoluteSiteUrl("/#website"),
  },
  about: {
    "@id": absoluteSiteUrl("/#software"),
  },
};

export default function TrackingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <JsonLd data={trackingPageStructuredData} />
      {children}
    </>
  );
}
