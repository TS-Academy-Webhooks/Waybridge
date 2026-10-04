import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionToken } from "@/lib/session";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileMarketingNavigation } from "@/components/marketing-navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteSiteUrl("/#website"),
  name: SITE_NAME,
  url: absoluteSiteUrl("/"),
  description: SITE_DESCRIPTION,
};

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const token = await getSessionToken();

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={websiteStructuredData} />
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrandMark className="size-8 rounded-lg" />
            Waybridge
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-4 text-sm md:flex"
          >
            <Link href="/about" className="text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link href="/track" className="text-muted-foreground hover:text-foreground">
              Track a shipment
            </Link>
            {token ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </nav>
          <MobileMarketingNavigation isAuthenticated={Boolean(token)} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Waybridge. Built for reliable shipment tracking.
      </footer>
    </div>
  );
}
