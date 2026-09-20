import Link from "next/link";
import { Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MacroBar } from "@/components/voeding/MacroBar";
import type { MacroTotals } from "@/lib/nutrition";

export function NutritionCard({
  totals,
  calorieGoal,
  proteinGoal,
}: {
  totals: MacroTotals;
  calorieGoal: number;
  proteinGoal: number;
}) {
  return (
    <Link href="/voeding">
      <Card className="rounded-2xl py-0">
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Utensils className="size-4" />
            </div>
            <p className="font-heading text-sm font-semibold">Voeding</p>
          </div>
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
        </CardContent>
      </Card>
    </Link>
  );
}
