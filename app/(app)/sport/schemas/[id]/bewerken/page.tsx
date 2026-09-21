import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchExercises, fetchScheduleDetail } from "@/lib/data/sport";
import { ScheduleForm } from "@/components/sport/ScheduleForm";
import { updateSchedule } from "@/app/(app)/sport/schemas/actions";

export default async function BewerkSchemaPage(
  props: PageProps<"/sport/schemas/[id]/bewerken">
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const [schedule, exercises] = await Promise.all([
    fetchScheduleDetail(supabase, id),
    fetchExercises(supabase),
  ]);

  if (!schedule) notFound();

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="px-4 font-heading text-2xl font-bold">Schema bewerken</h1>
      <ScheduleForm
        mode="edit"
        allExercises={exercises}
        action={updateSchedule.bind(null, schedule.id)}
        initialValues={{
          title: schedule.title,
          exercises: schedule.schedule_exercises.map((se) => ({
            exercise_id: se.exercise_id,
            name: se.exercises!.name,
            target_sets: se.target_sets,
            target_reps: se.target_reps,
          })),
        }}
      />
    </div>
  );
}
