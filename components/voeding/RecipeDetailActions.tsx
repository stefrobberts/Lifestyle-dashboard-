"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  deleteRecipe,
  toggleRecipeFavorite,
} from "@/app/(app)/voeding/recepten/actions";

export function RecipeDetailActions({
  recipeId,
  title,
  isFavorite,
}: {
  recipeId: string;
  title: string;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleToggleFavorite() {
    setFavorite((f) => !f);
    startTransition(async () => {
      const result = await toggleRecipeFavorite(recipeId, !favorite);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await deleteRecipe(recipeId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Recept verwijderd");
      router.push("/voeding/recepten");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label={favorite ? "Uit favorieten" : "Aan favorieten toevoegen"}
        className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground"
      >
        <Star className={favorite ? "size-5 fill-warning text-warning" : "size-5"} />
      </button>
      <Link
        href={`/voeding/recepten/${recipeId}/bewerken`}
        aria-label="Bewerken"
        className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground"
      >
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Verwijderen"
        className="flex size-11 items-center justify-center rounded-full border border-border text-destructive"
      >
        <Trash2 className="size-4" />
      </button>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Recept verwijderen?</DrawerTitle>
            <DrawerDescription>
              &ldquo;{title}&rdquo; wordt permanent verwijderd.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-11 rounded-[12px] text-base"
            >
              Verwijderen
            </Button>
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-[12px] text-base"
                >
                  Annuleren
                </Button>
              }
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
