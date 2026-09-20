"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarPlus, ChefHat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MacroBar } from "@/components/voeding/MacroBar";
import { DiaryMealSection, type DiaryEntryView } from "@/components/voeding/DiaryMealSection";
import { LogFoodSheet } from "@/components/voeding/LogFoodSheet";
import { copyFromYesterday } from "@/app/(app)/voeding/actions";
import type { MacroTotals } from "@/lib/nutrition";

const MEAL_LABELS: Record<string, string> = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  diner: "Diner",
  snack: "Snack",
};

export function VoedingDiary({
  entryDate,
  entriesByMeal,
  totals,
  calorieGoal,
  proteinGoal,
}: {
  entryDate: string;
  entriesByMeal: Record<string, DiaryEntryView[]>;
  totals: MacroTotals;
  calorieGoal: number;
  proteinGoal: number;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasEntries = Object.values(entriesByMeal).some((list) => list.length > 0);

  function handleCopyFromYesterday() {
    startTransition(async () => {
      const result = await copyFromYesterday(entryDate);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Gisteren gekopieerd naar vandaag");
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Voeding</h1>
        <div className="flex gap-2">
          <Link
            href="/voeding/recepten"
            className="flex min-h-11 items-center gap-1.5 rounded-[12px] border border-border px-3 text-sm font-medium text-muted-foreground"
          >
            <ChefHat className="size-4" />
            Recepten
          </Link>
          <Link
            href="/voeding/week"
            className="flex min-h-11 items-center rounded-[12px] border border-border px-3 text-sm font-medium text-muted-foreground"
          >
            Week
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-3">
          <MacroBar
            label="Calorieën"
            value={totals.calories}
            goal={calorieGoal}
            unit="kcal"
            colorClassName="bg-primary"
          />
          <MacroBar
            label="Eiwit"
            value={totals.protein_g}
            goal={proteinGoal}
            colorClassName="bg-success"
          />
          <MacroBar label="Koolhydraten" value={totals.carbs_g} colorClassName="bg-warning" />
          <MacroBar label="Vet" value={totals.fat_g} colorClassName="bg-destructive" />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="h-11 flex-1 gap-1.5 rounded-[12px] text-base"
        >
          <Plus className="size-4" />
          Maaltijd loggen
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopyFromYesterday}
          disabled={isPending}
          aria-label="Kopieer van gisteren"
          className="h-11 w-11 rounded-[12px] p-0"
        >
          <CalendarPlus className="size-5" />
        </Button>
      </div>

      {hasEntries ? (
        <div className="flex flex-col gap-5">
          {Object.entries(MEAL_LABELS).map(([key, label]) => (
            <DiaryMealSection
              key={key}
              title={label}
              entries={entriesByMeal[key] ?? []}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nog niets gelogd vandaag. Voeg een maaltijd toe of kopieer gisteren.
          </p>
        </div>
      )}

      <LogFoodSheet open={sheetOpen} onOpenChange={setSheetOpen} entryDate={entryDate} />
    </div>
  );
}
