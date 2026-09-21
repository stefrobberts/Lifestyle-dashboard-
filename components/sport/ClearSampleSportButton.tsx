"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSampleSportData } from "@/app/(app)/sport/schemas/actions";

export function ClearSampleSportButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await clearSampleSportData();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Voorbeeldschema's gewist");
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className="h-11 w-full gap-2 rounded-[12px] text-base"
    >
      <Trash2 className="size-4" />
      Voorbeeldschema&apos;s wissen
    </Button>
  );
}
