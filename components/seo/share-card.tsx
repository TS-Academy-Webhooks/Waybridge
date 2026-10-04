import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "@/lib/seo";

const logoData = await readFile(
  join(process.cwd(), "public", "icons", "waybridge-512x512.png"),
  "base64",
);
const logoSource = `data:image/png;base64,${logoData}`;

export function ShareCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a native image with an embedded data URI. */}
        <img
          src={logoSource}
          width={48}
          height={48}
          alt=""
          style={{ borderRadius: 12 }}
        />
        <span style={{ fontSize: 30, fontWeight: 700 }}>Waybridge</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.05 }}>
          Logistics tracking
        </span>
        <span
          style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.05,
            color: "#a5b4fc",
          }}
        >
          &amp; webhook delivery
        </span>
        <span style={{ marginTop: 12, fontSize: 24, color: "#cbd5e1" }}>
          Manage shipments and notify connected systems when statuses change.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        <span style={{ color: "#cbd5e1" }}>
          Shipment visibility. Reliable events.
        </span>
        <span style={{ color: "#a5b4fc" }}>{SITE_URL.hostname}</span>
      </div>
    </div>
  );
}
