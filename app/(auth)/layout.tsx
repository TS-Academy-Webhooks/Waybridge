import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";

export const metadata: Metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-5">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <BrandMark className="size-8 rounded-lg" />
          Waybridge <span className="font-normal">· Back to home</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
