import { dateKey } from "@/lib/date";
import { isTaskScheduledForDate, type TaskRecurrence } from "@/lib/recurrence";

const MAX_LOOKBACK_DAYS = 400;

/**
 * Telt het aantal opeenvolgende geplande dagen dat is afgevinkt, terugkijkend
 * vanaf vandaag. Vandaag telt niet mee als "gebroken" als die nog niet is
 * afgevinkt: er is immers nog tijd. Niet-geplande dagen worden overgeslagen.
 */
export function calculateStreak(
  task: TaskRecurrence,
  completedDates: ReadonlySet<string>,
  today: Date
): number {
  let streak = 0;
  const cursor = new Date(today);

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const isToday = i === 0;
    if (isTaskScheduledForDate(task, cursor)) {
      const done = completedDates.has(dateKey(cursor));
      if (done) {
        streak++;
      } else if (!isToday) {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
