"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const THEME_COLORS = {
  light: "#ffffff",
  dark: "#090b0c",
} as const;

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") {
      return;
    }

    let themeColorMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.name = "theme-color";
      document.head.append(themeColorMeta);
    }

    themeColorMeta.content = THEME_COLORS[resolvedTheme];
  }, [resolvedTheme]);

  return null;
}
