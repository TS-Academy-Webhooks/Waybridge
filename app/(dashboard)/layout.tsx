import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { SessionRefresh } from "@/features/auth/components/session-refresh";
import {
  DashboardBreadcrumbs,
  DashboardNavigationProvider,
} from "@/features/dashboard/components/dashboard-breadcrumbs";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, expiresAt } = await verifySession();

  return (
    <DashboardNavigationProvider key={user.id} userId={user.id}>
      <SidebarProvider>
        <SessionRefresh expiresAt={expiresAt} />
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SidebarTrigger className="-ml-1 shrink-0" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 shrink-0"
              />
              <DashboardBreadcrumbs />
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Back to homepage"
              >
                <Link href="/">
                  <Home />
                  <span className="sr-only">Back to homepage</span>
                </Link>
              </Button>
              <ModeToggle />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardNavigationProvider>
  );
}
