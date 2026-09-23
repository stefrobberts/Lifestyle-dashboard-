"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDutchDate } from "@/lib/date";

const SWIPE_THRESHOLD = 88;

export type MeasurementRowView = {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  arm_cm: number | null;
  delta: number | null;
};

function otherFieldsLabel(measurement: MeasurementRowView) {
  const parts: string[] = [];
  if (measurement.body_fat_percentage) parts.push("vetpercentage");
  const circumferences = [
    measurement.waist_cm && "taille",
    measurement.chest_cm && "borst",
    measurement.hips_cm && "heupen",
    measurement.arm_cm && "bovenarm",
  ].filter(Boolean) as string[];
  if (circumferences.length > 0) parts.push(circumferences.join(", "));
  return parts.join(" · ");
}

export function MeasurementRow({
  measurement,
  onDelete,
  onOpen,
}: {
  measurement: MeasurementRowView;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const extra = otherFieldsLabel(measurement);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) onDelete();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 flex items-center justify-end rounded-2xl bg-destructive/20 pr-5 text-destructive"
      >
        <Trash2 className="size-5" />
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative rounded-2xl border border-border bg-card"
      >
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {formatDutchDate(new Date(`${measurement.measured_at}T00:00:00`))}
            </span>
            {extra && (
              <span className="text-xs text-muted-foreground capitalize">{extra}</span>
            )}
          </div>
          {measurement.weight_kg !== null && (
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span className="text-base font-semibold tabular-nums">
                {measurement.weight_kg.toLocaleString("nl-NL")} kg
              </span>
              {measurement.delta !== null && measurement.delta !== 0 && (
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    measurement.delta < 0 ? "text-success" : "text-warning"
                  )}
                >
                  {measurement.delta > 0 ? "+" : ""}
                  {measurement.delta.toLocaleString("nl-NL")}
                </span>
              )}
            </span>
          )}
        </button>
      </motion.div>
    </div>
  );
}
