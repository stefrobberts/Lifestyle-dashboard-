"use client";

import { useActionState, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type TaskCategory = "supplement" | "verzorging" | "eigen";
export type TaskFrequency = "daily" | "specific_days" | "every_x_days";

export type TaskFormValues = {
  id?: string;
  title: string;
  category: TaskCategory;
  frequency_type: TaskFrequency;
  specific_days: number[];
  every_x_days: number | null;
  reminder_time: string | null;
};

type FormState = { status: "idle" | "error"; message?: string };

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "supplement", label: "Supplement" },
  { value: "verzorging", label: "Verzorging" },
  { value: "eigen", label: "Eigen taak" },
];

const FREQUENCIES: { value: TaskFrequency; label: string }[] = [
  { value: "daily", label: "Elke dag" },
  { value: "specific_days", label: "Specifieke dagen" },
  { value: "every_x_days", label: "Elke X dagen" },
];

const WEEKDAYS = [
  { value: 1, label: "Ma" },
  { value: 2, label: "Di" },
  { value: 3, label: "Wo" },
  { value: 4, label: "Do" },
  { value: 5, label: "Vr" },
  { value: 6, label: "Za" },
  { value: 7, label: "Zo" },
];

const EMPTY_VALUES: TaskFormValues = {
  title: "",
  category: "eigen",
  frequency_type: "daily",
  specific_days: [],
  every_x_days: 7,
  reminder_time: null,
};

export function TaskFormSheet({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: TaskFormValues;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onDelete?: () => void;
}) {
  const isEdit = Boolean(initialValues?.id);
  const [category, setCategory] = useState<TaskCategory>(
    initialValues?.category ?? "eigen"
  );
  const [frequency, setFrequency] = useState<TaskFrequency>(
    initialValues?.frequency_type ?? "daily"
  );
  const [specificDays, setSpecificDays] = useState<number[]>(
    initialValues?.specific_days ?? []
  );

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

  function toggleDay(day: number) {
    setSpecificDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort()
    );
  }

  const values = initialValues ?? EMPTY_VALUES;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form action={formAction} className="flex flex-col">
          <DrawerHeader>
            <DrawerTitle>
              {isEdit ? "Taak bewerken" : "Taak toevoegen"}
            </DrawerTitle>
            <DrawerDescription>
              Stel in hoe vaak deze taak terugkomt.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={80}
                defaultValue={values.title}
                placeholder="Bijv. Magnesium innemen"
                className="h-11 rounded-[12px] text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categorie</Label>
              <input type="hidden" name="category" value={category} />
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={cn(
                      "min-h-11 rounded-[12px] border px-2 text-sm font-medium transition-colors",
                      category === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Frequentie</Label>
              <input type="hidden" name="frequency_type" value={frequency} />
              <div className="grid grid-cols-1 gap-2">
                {FREQUENCIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFrequency(option.value)}
                    className={cn(
                      "min-h-11 rounded-[12px] border px-3 text-left text-sm font-medium transition-colors",
                      frequency === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {frequency === "specific_days" && (
              <div className="flex flex-col gap-2">
                <Label>Op welke dagen?</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <label key={day.value}>
                      <input
                        type="checkbox"
                        name="specific_days"
                        value={day.value}
                        checked={specificDays.includes(day.value)}
                        onChange={() => toggleDay(day.value)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                          specificDays.includes(day.value)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {day.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {frequency === "every_x_days" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="every_x_days">Elke hoeveel dagen?</Label>
                <Input
                  id="every_x_days"
                  name="every_x_days"
                  type="number"
                  inputMode="numeric"
                  min={2}
                  max={365}
                  defaultValue={values.every_x_days ?? 7}
                  className="h-11 rounded-[12px] text-base"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="reminder_time">Herinnering (optioneel)</Label>
              <Input
                id="reminder_time"
                name="reminder_time"
                type="time"
                defaultValue={values.reminder_time ?? ""}
                className="h-11 rounded-[12px] text-base"
              />
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
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="h-11 rounded-[12px] text-base text-destructive hover:text-destructive"
              >
                Taak verwijderen
              </Button>
            )}
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
        </form>
      </DrawerContent>
    </Drawer>
  );
}
