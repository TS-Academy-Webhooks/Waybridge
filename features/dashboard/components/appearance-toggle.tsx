// features/dashboard/components/appearance-toggle.tsx
"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function AppearanceToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex gap-1 rounded-md border p-1">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTheme(option.value)}
          className={cn(
            "gap-2",
            theme === option.value && "bg-accent text-accent-foreground"
          )}
        >
          <option.icon className="size-4" />
          {option.label}
        </Button>
      ))}
    </div>
  );
}
