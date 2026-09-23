"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateKey } from "@/lib/date";

export type MeasurementValues = {
  measured_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  arm_cm: number | null;
  notes: string | null;
};

type FormState = { status: "idle" | "error"; message?: string };

function numberField(
  id: string,
  label: string,
  unit: string | null,
  defaultValue: number | null | undefined
) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label} {unit && <span className="text-muted-foreground">({unit})</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        step="0.1"
        min={0}
        defaultValue={defaultValue ?? undefined}
        className="h-11 rounded-[12px] text-base"
      />
    </div>
  );
}

export function MeasurementFormSheet({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: MeasurementValues;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onDelete?: () => void;
}) {
  const isEdit = Boolean(initialValues);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await onSubmit(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      onOpenChange(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form action={formAction} className="flex max-h-[85vh] flex-col">
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Meting bewerken" : "Meting invoeren"}</DrawerTitle>
            <DrawerDescription>
              Vul in wat je gemeten hebt, de rest laat je leeg.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="measured_at">Datum</Label>
              <Input
                id="measured_at"
                name="measured_at"
                type="date"
                required
                defaultValue={initialValues?.measured_at ?? dateKey(new Date())}
                className="h-11 rounded-[12px] text-base"
              />
            </div>

            {numberField("weight_kg", "Gewicht", "kg", initialValues?.weight_kg)}
            {numberField(
              "body_fat_percentage",
              "Vetpercentage",
              "%",
              initialValues?.body_fat_percentage
            )}

            <div className="flex flex-col gap-2">
              <Label>Omtrekken (cm)</Label>
              <div className="grid grid-cols-2 gap-3">
                {numberField("waist_cm", "Taille", null, initialValues?.waist_cm)}
                {numberField("chest_cm", "Borst", null, initialValues?.chest_cm)}
                {numberField("hips_cm", "Heupen", null, initialValues?.hips_cm)}
                {numberField("arm_cm", "Bovenarm", null, initialValues?.arm_cm)}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notitie (optioneel)</Label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={initialValues?.notes ?? undefined}
                className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-base outline-none focus:border-primary"
              />
            </div>

            {state.status === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={isPending} className="h-11 rounded-[12px] text-base">
              {isPending ? "Bezig met opslaan…" : "Opslaan"}
            </Button>
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="h-11 gap-1.5 rounded-[12px] text-base text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Meting verwijderen
              </Button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
