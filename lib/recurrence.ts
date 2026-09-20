import { dateKey, daysBetween, isoWeekday } from "@/lib/date";

export type TaskRecurrence = {
  frequency_type: "daily" | "specific_days" | "every_x_days";
  specific_days: number[] | null;
  every_x_days: number | null;
  anchor_date: string;
};

/** Bepaalt of een taak op de gegeven dag gepland staat. */
export function isTaskScheduledForDate(
  task: TaskRecurrence,
  date: Date
): boolean {
  switch (task.frequency_type) {
    case "daily":
      return true;
    case "specific_days":
      return (task.specific_days ?? []).includes(isoWeekday(date));
    case "every_x_days": {
      if (!task.every_x_days || task.every_x_days < 1) return false;
      const diff = daysBetween(task.anchor_date, dateKey(date));
      return diff >= 0 && diff % task.every_x_days === 0;
    }
    default:
      return false;
  }
}
