// components/theme-provider.tsx
// Thin re-export wrapper around next-themes, per shadcn's standard dark-mode
// setup (https://ui.shadcn.com/docs/dark-mode/next). Kept as its own client
// component so app/layout.tsx (a Server Component) can render it without
// itself needing "use client".
"use client";

import type { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
