"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WeightCard({
  latestWeight,
  delta,
  sparkline,
}: {
  latestWeight: number | null;
  delta: number | null;
  sparkline: { value: number }[];
}) {
  return (
    <Link href="/meer/metingen">
      <Card className="rounded-2xl py-0">
        <CardContent className="flex items-center gap-3 px-4 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Scale className="size-4" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="font-heading text-sm font-semibold">Gewichtsverloop</p>
            {latestWeight !== null ? (
              <span className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {latestWeight.toLocaleString("nl-NL")} kg
                </span>
                {delta !== null && delta !== 0 && (
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      delta < 0 ? "text-success" : "text-warning"
                    )}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta.toLocaleString("nl-NL")}
                  </span>
                )}
              </span>
            ) : (
              <p className="text-xs text-muted-foreground">Nog geen metingen</p>
            )}
          </div>
          {sparkline.length >= 2 && (
            <div className="h-8 w-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
