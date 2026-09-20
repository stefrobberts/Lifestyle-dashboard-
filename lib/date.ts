/** Datumsleutel in lokale tijd (YYYY-MM-DD), bewust geen toISOString om tijdzoneverschuiving te voorkomen. */
export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** ISO-weekdag: maandag = 1 … zondag = 7. */
export function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function formatDutchDate(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}
