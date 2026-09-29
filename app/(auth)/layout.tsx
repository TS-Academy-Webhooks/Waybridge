import type { ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
