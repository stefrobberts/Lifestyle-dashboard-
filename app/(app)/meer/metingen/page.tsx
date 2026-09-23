import Link from "next/link";
import { Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureSampleMeasurements, fetchMeasurements } from "@/lib/data/measurements";
import { calculateTrendLine, measurementDelta } from "@/lib/measurements";
import { dateKey, daysBetween } from "@/lib/date";
import { cn } from "@/lib/utils";
import { MetingenTabs } from "@/components/metingen/MetingenTabs";
import { MeasurementChart, type ChartPoint } from "@/components/metingen/MeasurementChart";
import { MeasurementList, type MeasurementListItem } from "@/components/metingen/MeasurementList";

type MetricKey = "gewicht" | "vetpercentage" | "taille" | "borst" | "heupen" | "bovenarm";

const METRICS: {
  value: MetricKey;
  label: string;
  field: "weight_kg" | "body_fat_percentage" | "waist_cm" | "chest_cm" | "hips_cm" | "arm_cm";
  unit: string;
}[] = [
  { value: "gewicht", label: "Gewicht", field: "weight_kg", unit: "kg" },
  { value: "vetpercentage", label: "Vetpercentage", field: "body_fat_percentage", unit: "%" },
  { value: "taille", label: "Taille", field: "waist_cm", unit: "cm" },
  { value: "borst", label: "Borst", field: "chest_cm", unit: "cm" },
  { value: "heupen", label: "Heupen", field: "hips_cm", unit: "cm" },
  { value: "bovenarm", label: "Bovenarm", field: "arm_cm", unit: "cm" },
];

const PERIODS = [
  { value: "30", label: "30 dagen", days: 30 },
  { value: "90", label: "90 dagen", days: 90 },
  { value: "365", label: "1 jaar", days: 365 },
  { value: "alles", label: "Alles", days: null },
] as const;

export default async function MetingenPage(props: PageProps<"/meer/metingen">) {
  const searchParams = await props.searchParams;
  const metricParam = typeof searchParams.metric === "string" ? searchParams.metric : "gewicht";
  const periodParam = typeof searchParams.periode === "string" ? searchParams.periode : "90";

  const metric = METRICS.find((m) => m.value === metricParam) ?? METRICS[0];
  const period = PERIODS.find((p) => p.value === periodParam) ?? PERIODS[1];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureSampleMeasurements(supabase, user.id);

  const today = new Date();
  const sinceKey =
    period.days !== null
      ? dateKey(new Date(today.getTime() - period.days * 86_400_000))
      : undefined;

  const [allMeasurements, chartMeasurements] = await Promise.all([
    fetchMeasurements(supabase),
    period.value === "alles" ? fetchMeasurements(supabase) : fetchMeasurements(supabase, sinceKey),
  ]);

  // Meest recente meting die het gekozen veld heeft, voor de gewicht/vetpercentage-tegels.
  const latestWeight = allMeasurements.find((m) => m.weight_kg !== null)?.weight_kg ?? null;
  const previousWeight = allMeasurements.filter((m) => m.weight_kg !== null)[1]?.weight_kg ?? null;
  const latestFat = allMeasurements.find((m) => m.body_fat_percentage !== null)?.body_fat_percentage ?? null;

  const chartRows = [...chartMeasurements]
    .filter((m) => m[metric.field] !== null)
    .sort((a, b) => a.measured_at.localeCompare(b.measured_at));

  const firstKey = chartRows[0]?.measured_at;
  const trendLine = firstKey
    ? calculateTrendLine(
        chartRows.map((m) => ({
          x: daysBetween(firstKey, m.measured_at),
          y: m[metric.field] as number,
        }))
      )
    : null;

  const chartData: ChartPoint[] = chartRows.map((m) => ({
    date: m.measured_at,
    value: m[metric.field] as number,
    trend: trendLine ? trendLine.slope * daysBetween(firstKey!, m.measured_at) + trendLine.intercept : null,
  }));

  const listItems: MeasurementListItem[] = allMeasurements.map((m, index) => {
    const previousWithWeight = allMeasurements.slice(index + 1).find((prev) => prev.weight_kg !== null);
    return {
      id: m.id,
      measured_at: m.measured_at,
      weight_kg: m.weight_kg,
      body_fat_percentage: m.body_fat_percentage,
      waist_cm: m.waist_cm,
      chest_cm: m.chest_cm,
      hips_cm: m.hips_cm,
      arm_cm: m.arm_cm,
      notes: m.notes,
      delta:
        m.weight_kg !== null && previousWithWeight?.weight_kg
          ? measurementDelta(m.weight_kg, previousWithWeight.weight_kg)
          : null,
    };
  });

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Metingen</h1>

      <MetingenTabs active="/meer/metingen" />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scale className="size-3.5" />
            Gewicht
          </span>
          {latestWeight !== null ? (
            <span className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold tabular-nums">
                {latestWeight.toLocaleString("nl-NL")} kg
              </span>
              {previousWeight !== null && (
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    measurementDelta(latestWeight, previousWeight) < 0
                      ? "text-success"
                      : "text-warning"
                  )}
                >
                  {measurementDelta(latestWeight, previousWeight) > 0 ? "+" : ""}
                  {measurementDelta(latestWeight, previousWeight).toLocaleString("nl-NL")}
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Nog niet ingevuld</span>
          )}
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="text-xs text-muted-foreground">Vetpercentage</span>
          {latestFat !== null ? (
            <span className="font-heading text-lg font-bold tabular-nums">
              {latestFat.toLocaleString("nl-NL")}%
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Nog niet ingevuld</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {METRICS.map((option) => (
            <Link
              key={option.value}
              href={`/meer/metingen?metric=${option.value}&periode=${period.value}`}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-sm font-medium",
                option.value === metric.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2">
          {PERIODS.map((option) => (
            <Link
              key={option.value}
              href={`/meer/metingen?metric=${metric.value}&periode=${option.value}`}
              className={cn(
                "min-h-8 flex-1 rounded-full border text-center text-xs leading-8 font-medium",
                option.value === period.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nog geen metingen met {metric.label.toLowerCase()} in deze periode.
            </p>
          ) : (
            <MeasurementChart data={chartData} unit={metric.unit} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Geschiedenis
        </h2>
        <MeasurementList initialMeasurements={listItems} />
      </div>
    </div>
  );
}
