"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDutchDate } from "@/lib/date";

export type ChartPoint = { date: string; value: number; trend: number | null };

function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; payload: ChartPoint }[];
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-popover-foreground">
        {formatDutchDate(new Date(`${point.date}T00:00:00`))}
      </p>
      <p className="tabular-nums text-muted-foreground">
        {point.value.toLocaleString("nl-NL")} {unit}
      </p>
    </div>
  );
}

export function MeasurementChart({ data, unit }: { data: ChartPoint[]; unit: string }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickFormatter={(value: string) =>
              formatDutchDate(new Date(`${value}T00:00:00`)).replace(/^\w+ /, "")
            }
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            width={44}
            domain={["dataMin - 1", "dataMax + 1"]}
            tickCount={4}
            tickFormatter={(value: number) => value.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: "var(--border)" }} />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
