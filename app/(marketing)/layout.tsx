import Link from "next/link";
import type { ReactNode } from "react";
import { Webhook } from "lucide-react";
import { getSessionToken } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const token = await getSessionToken();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Webhook className="size-4" />
            </div>
            Waybridge
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-foreground">
              About
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
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Waybridge. Built for reliable shipment tracking.
      </footer>
    </div>
  );
}
