const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const progress = total > 0 ? completed / total : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--success)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-xl font-bold tabular-nums">
          {completed}/{total}
        </span>
        <span className="text-[11px] text-muted-foreground">gedaan</span>
      </div>
    </div>
  );
}
