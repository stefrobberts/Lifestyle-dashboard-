"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Gekopieerd naar klembord");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopiëren is niet gelukt.");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className="h-11 w-full gap-1.5 rounded-[12px] text-base"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Gekopieerd" : "Tekst kopiëren"}
    </Button>
  );
}
