"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileMarketingNavigation({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <SheetHeader className="border-b pe-12">
          <SheetTitle className="flex items-center gap-2">
            <BrandMark className="size-7 rounded-md" size={28} />
            Waybridge
          </SheetTitle>
          <SheetDescription>Navigate the platform.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 py-2">
          <MobileNavigationLink href="/about">About</MobileNavigationLink>
          <MobileNavigationLink href="/track">Track a shipment</MobileNavigationLink>
          {isAuthenticated ? (
            <SheetClose asChild>
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg", className: "mt-2 w-full" })}
              >
                Dashboard
              </Link>
            </SheetClose>
          ) : (
            <>
              <MobileNavigationLink href="/login">Sign in</MobileNavigationLink>
              <SheetClose asChild>
                <Link
                  href="/signup"
                  className={buttonVariants({ size: "lg", className: "mt-2 w-full" })}
                >
                  Get started
                </Link>
              </SheetClose>
            </>
          )}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t px-4 py-4">
          <span className="text-sm font-medium">Appearance</span>
          <ModeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavigationLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </Link>
    </SheetClose>
  );
}
