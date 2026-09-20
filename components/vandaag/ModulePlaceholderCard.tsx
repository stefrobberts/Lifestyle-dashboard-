import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ModulePlaceholderCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="flex items-center gap-4 px-4 py-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <p className="font-heading text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
