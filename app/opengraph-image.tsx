import { ImageResponse } from "next/og";
import { ShareCard } from "@/components/seo/share-card";

export const alt = "Waybridge logistics tracking and webhook delivery platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<ShareCard />, size);
}
