// features/dashboard/components/copy-value.tsx
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={value} className="font-mono text-sm" />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Copy value"
        onClick={handleCopy}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}
