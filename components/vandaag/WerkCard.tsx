import Link from "next/link";
import { ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PRIORITY_LABEL: Record<string, string> = {
  hoog: "hoge prioriteit",
  normaal: "normale prioriteit",
  laag: "lage prioriteit",
};

export function WerkCard({
  taskCount,
  topPriority,
}: {
  taskCount: number;
  topPriority: "hoog" | "normaal" | "laag" | null;
}) {
  return (
    <Link href="/werk">
      <Card className="rounded-2xl py-0">
        <CardContent className="flex items-center gap-3 px-4 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ListTodo className="size-4" />
          </div>
          <div className="flex flex-col">
            <p className="font-heading text-sm font-semibold">Werk</p>
            <p
              className={cn(
                "text-xs text-muted-foreground",
                topPriority === "hoog" && "text-destructive"
              )}
            >
              {taskCount === 0
                ? "Niets te doen vandaag"
                : `${taskCount} ${taskCount === 1 ? "taak" : "taken"} vandaag${
                    topPriority ? ` · ${PRIORITY_LABEL[topPriority]}` : ""
                  }`}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
