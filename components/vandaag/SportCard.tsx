import Link from "next/link";
import { Dumbbell, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startWorkout } from "@/app/(app)/sport/actions";

export function SportCard({
  schedule,
}: {
  schedule: { id: string; title: string } | null;
}) {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="flex items-center gap-3 px-4 py-4">
        <Link href="/sport" className="flex flex-1 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Dumbbell className="size-4" />
          </div>
          <div className="flex flex-col">
            <p className="font-heading text-sm font-semibold">Sport</p>
            <p className="text-xs text-muted-foreground">
              {schedule ? schedule.title : "Nog geen schema's"}
            </p>
          </div>
        </Link>
        {schedule && (
          <form action={startWorkout.bind(null, schedule.id, schedule.title)}>
            <Button
              type="submit"
              size="sm"
              aria-label="Workout starten"
              className="h-9 gap-1.5 rounded-[10px] text-xs"
            >
              <Play className="size-3.5" />
              Start
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
