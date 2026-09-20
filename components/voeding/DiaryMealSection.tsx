"use client";

import { useTransition } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEntry } from "@/app/(app)/voeding/actions";

export type DiaryEntryView = {
  id: string;
  title: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  detail: string;
};

const SWIPE_THRESHOLD = 88;

function EntryRow({ entry }: { entry: DiaryEntryView }) {
  const [, startTransition] = useTransition();
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      startTransition(async () => {
        const result = await deleteEntry(entry.id);
        if (!result.success) toast.error(result.error);
      });
    }
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
        className="relative flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium">{entry.title}</span>
          <span className="text-xs text-muted-foreground">{entry.detail}</span>
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums">
          {Math.round(entry.calories)} kcal
        </span>
      </motion.div>
    </div>
  );
}

export function DiaryMealSection({
  title,
  entries,
}: {
  title: string;
  entries: DiaryEntryView[];
}) {
  if (entries.length === 0) return null;

  const subtotal = entries.reduce((sum, e) => sum + e.calories, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {Math.round(subtotal)} kcal
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
