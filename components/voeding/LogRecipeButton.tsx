"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
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
import { dateKey } from "@/lib/date";
import { logRecipe } from "@/app/(app)/voeding/actions";

type MealType = "ontbijt" | "lunch" | "diner" | "snack";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "ontbijt", label: "Ontbijt" },
  { value: "lunch", label: "Lunch" },
  { value: "diner", label: "Diner" },
  { value: "snack", label: "Snack" },
];

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "ontbijt";
  if (hour < 15) return "lunch";
  if (hour < 21) return "diner";
  return "snack";
}

type FormState = { status: "idle" | "error"; message?: string };

export function LogRecipeButton({ recipeId }: { recipeId: string }) {
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>(defaultMealType());

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      formData.set("recipe_id", recipeId);
      formData.set("meal_type", mealType);
      formData.set("entry_date", dateKey(new Date()));
      const result = await logRecipe(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      toast.success("Toegevoegd aan je dagboek");
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
        className="h-11 w-full gap-1.5 rounded-[12px] text-base"
      >
        <Plus className="size-4" />
        Log als maaltijd
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <form action={formAction}>
            <DrawerHeader>
              <DrawerTitle>Log als maaltijd</DrawerTitle>
              <DrawerDescription>
                Hoeveel porties heb je gegeten?
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-5 px-4 pb-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="servings">Aantal porties</Label>
                <Input
                  id="servings"
                  name="servings"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  defaultValue={1}
                  required
                  className="h-11 rounded-[12px] text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Maaltijd</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMealType(option.value)}
                      className={cn(
                        "min-h-11 rounded-[12px] border px-1 text-xs font-medium",
                        mealType === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {option.label}
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
                {isPending ? "Bezig met opslaan…" : "Toevoegen"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
