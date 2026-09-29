// features/webhooks/components/secret-field.tsx
"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SecretField({ secret }: { secret: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        readOnly
        value={visible ? secret : maskDisplay(secret)}
        className="font-mono text-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={visible ? "Hide secret" : "Show secret"}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Copy secret"
        onClick={handleCopy}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

function maskDisplay(secret: string): string {
  return "•".repeat(Math.min(secret.length, 32));
}
