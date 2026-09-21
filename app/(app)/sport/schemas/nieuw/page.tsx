import { createClient } from "@/lib/supabase/server";
import { fetchExercises } from "@/lib/data/sport";
import { ScheduleForm } from "@/components/sport/ScheduleForm";
import { createSchedule } from "@/app/(app)/sport/schemas/actions";

export default async function NieuwSchemaPage() {
  const supabase = await createClient();
  const exercises = await fetchExercises(supabase);

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="px-4 font-heading text-2xl font-bold">Nieuw schema</h1>
      <ScheduleForm mode="create" allExercises={exercises} action={createSchedule} />
    </div>
  );
}
