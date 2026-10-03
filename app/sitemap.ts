import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/seo";

const PUBLIC_ROUTES = ["/", "/about", "/track"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: absoluteSiteUrl(path),
  }));
}
