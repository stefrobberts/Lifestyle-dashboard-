import { cn } from "@/lib/utils";

export function MacroBar({
  label,
  value,
  goal,
  unit = "g",
  colorClassName = "bg-primary",
}: {
  label: string;
  value: number;
  goal?: number;
  unit?: string;
  colorClassName?: string;
}) {
  const progress = goal ? Math.min(100, Math.round((value / goal) * 100)) : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">
          {Math.round(value)}
          {goal ? ` / ${Math.round(goal)}` : ""} {unit}
        </span>
      </div>
      {progress !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", colorClassName)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
