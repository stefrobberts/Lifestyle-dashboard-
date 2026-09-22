import { cn } from "@/lib/utils";
import { dateKey } from "@/lib/date";

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export function ContentCalendar({
  year,
  month,
  plannedByDay,
}: {
  year: number;
  month: number;
  plannedByDay: Map<string, string[]>;
}) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const monthLabel = new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(firstOfMonth);

  const today = dateKey(new Date());

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-center text-sm font-medium capitalize">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <div key={`blank-${index}`} />;
          const key = dateKey(new Date(year, month, day));
          const planned = plannedByDay.get(key);
          const isToday = key === today;
          return (
            <div
              key={key}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-xs tabular-nums",
                isToday && "border border-primary"
              )}
              title={planned?.join(", ")}
            >
              {day}
              {planned && planned.length > 0 && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
