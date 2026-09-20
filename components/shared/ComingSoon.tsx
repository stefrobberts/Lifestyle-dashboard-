import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-7" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
