export type LoggedSet = {
  exercise_id: string;
  weight_kg: number;
  reps: number;
};

/** Geschat 1RM via de Epley-formule. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/** Is deze set een nieuw persoonlijk record (op basis van geschat 1RM)? */
export function isPersonalRecord(
  newSet: { weight_kg: number; reps: number },
  previousBestEst1RM: number | null
): boolean {
  const est1RM = estimateOneRepMax(newSet.weight_kg, newSet.reps);
  if (est1RM <= 0) return false;
  return previousBestEst1RM === null || est1RM > previousBestEst1RM;
}

/** Totaal trainingsvolume (sets x reps x gewicht) van een lijst sets. */
export function calculateSessionVolume(sets: LoggedSet[]): number {
  return sets.reduce((total, s) => total + s.weight_kg * s.reps, 0);
}

export type ExerciseMuscleGroup = {
  id: string;
  muscle_group: string;
};

/** Groepeert het volume van een lijst sets per spiergroep. */
export function groupVolumeByMuscleGroup(
  sets: LoggedSet[],
  exercises: ExerciseMuscleGroup[]
): Record<string, number> {
  const muscleGroupByExercise = new Map(exercises.map((e) => [e.id, e.muscle_group]));
  const result: Record<string, number> = {};

  for (const set of sets) {
    const muscleGroup = muscleGroupByExercise.get(set.exercise_id);
    if (!muscleGroup) continue;
    result[muscleGroup] = (result[muscleGroup] ?? 0) + set.weight_kg * set.reps;
  }

  return result;
}

export type ScheduleForRotation = {
  id: string;
  sort_order: number;
};

/**
 * Bepaalt "de workout van vandaag": het schema na het laatst afgeronde
 * schema in de vastgelegde volgorde, met wraparound. Zonder eerdere
 * sessies is dat gewoon het eerste schema.
 */
export function nextScheduleInRotation(
  schedules: ScheduleForRotation[],
  lastCompletedScheduleId: string | null
): ScheduleForRotation | null {
  if (schedules.length === 0) return null;

  const sorted = [...schedules].sort((a, b) => a.sort_order - b.sort_order);

  if (!lastCompletedScheduleId) return sorted[0];

  const lastIndex = sorted.findIndex((s) => s.id === lastCompletedScheduleId);
  if (lastIndex === -1) return sorted[0];

  return sorted[(lastIndex + 1) % sorted.length];
}
