"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { createExercise } from "@/app/(app)/sport/oefeningen/actions";

const MUSCLE_GROUPS = [
  { value: "borst", label: "Borst" },
  { value: "rug", label: "Rug" },
  { value: "benen", label: "Benen" },
  { value: "schouders", label: "Schouders" },
  { value: "armen", label: "Armen" },
  { value: "buik", label: "Buik" },
] as const;

type FormState = { status: "idle" | "error"; message?: string };

export function AddExerciseSheet() {
  const [open, setOpen] = useState(false);
  const [muscleGroup, setMuscleGroup] = useState<string>("borst");

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      formData.set("muscle_group", muscleGroup);
      const result = await createExercise(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      setOpen(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 gap-1.5 rounded-[12px] text-sm"
      >
        <Plus className="size-4" />
        Nieuw
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <form action={formAction}>
            <DrawerHeader>
              <DrawerTitle>Oefening toevoegen</DrawerTitle>
              <DrawerDescription>
                Breidt je oefeningenbibliotheek uit.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 px-4 pb-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Bijv. Kabel rows"
                  className="h-11 rounded-[12px] text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Spiergroep</Label>
                <div className="grid grid-cols-3 gap-2">
                  {MUSCLE_GROUPS.map((group) => (
                    <button
                      key={group.value}
                      type="button"
                      onClick={() => setMuscleGroup(group.value)}
                      className={cn(
                        "min-h-11 rounded-[12px] border text-sm font-medium",
                        muscleGroup === group.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
              </div>
              {state.status === "error" && (
                <p role="alert" className="text-sm text-destructive">
                  {state.message}
                </p>
              )}
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 rounded-[12px] text-base"
              >
                {isPending ? "Bezig met opslaan…" : "Opslaan"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
