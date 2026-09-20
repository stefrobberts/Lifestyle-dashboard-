import { createClient } from "@/lib/supabase/server";
import { ensureDefaultData, fetchVandaagData } from "@/lib/data/vandaag";
import { fetchDiaryForDate } from "@/lib/data/voeding";
import { isTaskScheduledForDate, type TaskRecurrence } from "@/lib/recurrence";
import { calculateStreak } from "@/lib/streaks";
import { formatDutchDate } from "@/lib/date";
import { DailyChecklist, type ChecklistTask } from "@/components/vandaag/DailyChecklist";
import { DashboardCards, type CardPref } from "@/components/vandaag/DashboardCards";
import { NutritionCard } from "@/components/vandaag/NutritionCard";

function getGreeting(hour: number) {
  if (hour < 6) return "Goedenacht";
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

export default async function VandaagPage(props: PageProps<"/vandaag">) {
  const searchParams = await props.searchParams;
  const autoOpenCreate = searchParams.actie === "taak-toevoegen";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  await ensureDefaultData(supabase, user.id);
  const { today, todayKey, definitions, logs, cardPrefs } =
    await fetchVandaagData(supabase);

  const logsByTask = new Map<string, Set<string>>();
  for (const log of logs) {
    const set = logsByTask.get(log.task_definition_id) ?? new Set<string>();
    set.add(log.completed_date);
    logsByTask.set(log.task_definition_id, set);
  }

  const todaysTasks: ChecklistTask[] = definitions
    .map((def) => ({
      def,
      recurrence: {
        frequency_type: def.frequency_type as TaskRecurrence["frequency_type"],
        specific_days: def.specific_days,
        every_x_days: def.every_x_days,
        anchor_date: def.anchor_date,
      } satisfies TaskRecurrence,
    }))
    .filter(({ recurrence }) => isTaskScheduledForDate(recurrence, today))
    .map(({ def, recurrence }) => {
      const completedDates = logsByTask.get(def.id) ?? new Set<string>();
      return {
        id: def.id,
        title: def.title,
        category: def.category as ChecklistTask["category"],
        frequency_type: recurrence.frequency_type,
        specific_days: def.specific_days,
        every_x_days: def.every_x_days,
        reminder_time: def.reminder_time,
        completed: completedDates.has(todayKey),
        streak: calculateStreak(recurrence, completedDates, today),
      };
    });

  const cards: CardPref[] = cardPrefs.map((pref) => ({
    card_key: pref.card_key as CardPref["card_key"],
    sort_order: pref.sort_order,
    is_visible: pref.is_visible,
  }));

  const diary = await fetchDiaryForDate(supabase, todayKey);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {formatDutchDate(today)}
        </p>
        <h1 className="font-heading text-2xl font-bold">
          {getGreeting(today.getHours())}
        </h1>
      </div>

      <DailyChecklist
        initialTasks={todaysTasks}
        todayKey={todayKey}
        autoOpenCreate={autoOpenCreate}
      />

      <DashboardCards
        initialCards={cards}
        cardOverrides={{
          voeding: (
            <NutritionCard
              totals={diary.totals}
              calorieGoal={diary.calorieGoal}
              proteinGoal={diary.proteinGoal}
            />
          ),
        }}
      />
    </div>
  );
}
