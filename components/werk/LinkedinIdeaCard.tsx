import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  idee: "Idee",
  concept: "Concept",
  gepland: "Gepland",
  gepubliceerd: "Gepubliceerd",
};

const STATUS_STYLES: Record<string, string> = {
  idee: "bg-muted text-muted-foreground",
  concept: "bg-warning/15 text-warning",
  gepland: "bg-primary/15 text-primary",
  gepubliceerd: "bg-success/15 text-success",
};

export function LinkedinIdeaCard({
  id,
  subject,
  status,
  plannedDate,
}: {
  id: string;
  subject: string;
  status: string;
  plannedDate: string | null;
}) {
  return (
    <Link
      href={`/werk/linkedin/${id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Lightbulb className="size-4" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-medium">{subject}</span>
        {plannedDate && (
          <span className="text-xs text-muted-foreground">
            Gepland op {new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(`${plannedDate}T00:00:00`))}
          </span>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
          STATUS_STYLES[status]
        )}
      >
        {STATUS_LABELS[status]}
      </span>
    </Link>
  );
}
