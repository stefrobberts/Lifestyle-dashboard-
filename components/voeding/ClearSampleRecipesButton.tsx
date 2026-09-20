"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSampleRecipes } from "@/app/(app)/voeding/recepten/actions";

export function ClearSampleRecipesButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await clearSampleRecipes();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Voorbeeldrecepten gewist");
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
      Voorbeeldrecepten wissen
    </Button>
  );
}
