// features/webhooks/components/event-selector.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WEBHOOK_EVENT_OPTIONS } from "@/constants/webhook-events";

export function EventSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (events: string[]) => void;
}) {
  function toggle(event: string, checked: boolean) {
    if (event === "*") {
      onChange(checked ? ["*"] : []);
      return;
    }
    const withoutWildcard = value.filter((v) => v !== "*");
    onChange(
      checked
        ? [...withoutWildcard, event]
        : withoutWildcard.filter((v) => v !== event)
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2">
      {WEBHOOK_EVENT_OPTIONS.map((option) => {
        const checked = value.includes(option.value);
        return (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`event-${option.value}`}
              checked={checked}
              onCheckedChange={(next) => toggle(option.value, next === true)}
            />
            <Label htmlFor={`event-${option.value}`} className="font-normal">
              {option.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
