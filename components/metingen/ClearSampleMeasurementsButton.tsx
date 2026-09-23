"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSampleMeasurements } from "@/app/(app)/meer/metingen/actions";

export function ClearSampleMeasurementsButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await clearSampleMeasurements();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Voorbeeldmetingen gewist");
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
      Voorbeeldmetingen wissen
    </Button>
  );
}
