import type { Metadata } from "next";

const PRODUCTION_SITE_URL = "https://waybridge-six.vercel.app";
const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export const SITE_NAME = "Waybridge";
export const SITE_TITLE = "Waybridge | Shipment tracking and webhook delivery";
export const SITE_DESCRIPTION =
  "Manage shipments from creation to delivery and send signed, retryable webhook notifications when status changes.";
const SHARE_IMAGE_ALT =
  "Waybridge logistics tracking and webhook delivery platform";

function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const defaultUrl =
    process.env.NODE_ENV === "development"
      ? DEVELOPMENT_SITE_URL
      : PRODUCTION_SITE_URL;
  const siteUrl = new URL(configuredUrl || defaultUrl);

  if (
    (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") ||
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path, query, or fragment.",
    );
  }

  return siteUrl;
}

export const SITE_URL = getSiteUrl();

export function absoluteSiteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const brandedTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title: brandedTitle,
      description,
      url: path,
      images: [
        {
          url: absoluteSiteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: SHARE_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [
        {
          url: absoluteSiteUrl("/twitter-image"),
          alt: SHARE_IMAGE_ALT,
        },
      ],
    },
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
