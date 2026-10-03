import type { ReactNode } from "react";
import Link from "next/link";
import { Webhook } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

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
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Webhook className="size-4" />
          </span>
          Waybridge <span className="font-normal">· Back to home</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
