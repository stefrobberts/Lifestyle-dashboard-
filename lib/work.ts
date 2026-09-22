import { dateKey, isoWeekday } from "@/lib/date";

export type TaskView = "vandaag" | "deze-week" | "later";
export type RecurrenceType = "geen" | "dagelijks" | "wekelijks" | "maandelijks";

/** Is deze deadline vandaag of eerder (dus te laat als de taak nog niet af is)? */
export function isOverdue(deadline: string | null, today: Date): boolean {
  if (!deadline) return false;
  return deadline < dateKey(today);
}

/**
 * Bepaalt in welke weergave een taak thuishoort: vandaag (inclusief te
 * laat), deze week (t/m aanstaande zondag), of later (erna, of geen
 * deadline).
 */
export function categorizeTaskByDeadline(
  deadline: string | null,
  today: Date
): TaskView {
  if (!deadline) return "later";

  const todayKey = dateKey(today);
  if (deadline <= todayKey) return "vandaag";

  const daysUntilSunday = 7 - isoWeekday(today);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  const endOfWeekKey = dateKey(endOfWeek);

  if (deadline <= endOfWeekKey) return "deze-week";
  return "later";
}

/** Volgende deadline na het afronden van een terugkerende taak. */
export function nextRecurrenceDate(
  deadline: string | null,
  recurrenceType: RecurrenceType,
  today: Date
): string {
  const base = deadline ? new Date(`${deadline}T00:00:00`) : today;
  const next = new Date(base);

  switch (recurrenceType) {
    case "dagelijks":
      next.setDate(next.getDate() + 1);
      break;
    case "wekelijks":
      next.setDate(next.getDate() + 7);
      break;
    case "maandelijks":
      next.setMonth(next.getMonth() + 1);
      break;
    case "geen":
    default:
      break;
  }

  // Een terugkerende taak mag niet in het verleden blijven hangen.
  const todayKey = dateKey(today);
  const nextKey = dateKey(next);
  return nextKey < todayKey ? todayKey : nextKey;
}
