import { createClient } from "@/lib/supabase/server";
import { fetchWeekTotals } from "@/lib/data/voeding";
import { calculateWeeklyAverages } from "@/lib/nutrition";
import { dateKey, isoWeekday } from "@/lib/date";
import { WeekChart, type WeekChartDay } from "@/components/voeding/WeekChart";
import { MacroBar } from "@/components/voeding/MacroBar";

const DAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export default async function WeekOverzichtPage() {
  const supabase = await createClient();

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(monday.getDate() - (isoWeekday(today) - 1));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekDateKeys = weekDates.map(dateKey);

  const [entriesByDate, { data: settings }] = await Promise.all([
    fetchWeekTotals(supabase, weekDateKeys),
    supabase.from("user_settings").select("*").maybeSingle(),
  ]);

  const calorieGoal = settings?.calorie_goal ?? 2400;
  const proteinGoal = settings?.protein_goal_g ?? 180;

  const averages = calculateWeeklyAverages(entriesByDate);

  const chartData: WeekChartDay[] = weekDateKeys.map((key, index) => {
    const entries = entriesByDate.get(key) ?? [];
    const calories = entries.reduce((sum, e) => sum + e.calories, 0);
    return { label: DAY_LABELS[index], calories };
  });

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Weekoverzicht</h1>

      {averages.dayCount === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nog niets gelogd deze week.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-4">
            <WeekChart data={chartData} goal={calorieGoal} />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Gemiddeld per dag
            </p>
            <MacroBar
              label="Calorieën"
              value={averages.calories}
              goal={calorieGoal}
              unit="kcal"
              colorClassName="bg-primary"
            />
            <MacroBar
              label="Eiwit"
              value={averages.protein_g}
              goal={proteinGoal}
              colorClassName="bg-success"
            />
            <MacroBar
              label="Koolhydraten"
              value={averages.carbs_g}
              colorClassName="bg-warning"
            />
            <MacroBar label="Vet" value={averages.fat_g} colorClassName="bg-destructive" />
          </div>
        </>
      )}
    </div>
  );
}
