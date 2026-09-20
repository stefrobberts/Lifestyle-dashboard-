"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 88;

export type ChecklistTaskView = {
  id: string;
  title: string;
  reminder_time: string | null;
  completed: boolean;
  streak: number;
};

export function ChecklistItem({
  task,
  onToggle,
  onRequestDelete,
  onEdit,
}: {
  task: ChecklistTaskView;
  onToggle: () => void;
  onRequestDelete: () => void;
  onEdit: () => void;
}) {
  const x = useMotionValue(0);
  const completeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onToggle();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onRequestDelete();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity: completeOpacity }}
        className="absolute inset-0 flex items-center rounded-2xl bg-success/20 pl-5 text-success"
      >
        <Check className="size-5" />
      </motion.div>
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 flex items-center justify-end rounded-2xl bg-destructive/20 pr-5 text-destructive"
      >
        <Trash2 className="size-5" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={task.completed ? "Markeer als niet gedaan" : "Markeer als gedaan"}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            task.completed
              ? "border-success bg-success text-white"
              : "border-border"
          )}
        >
          {task.completed && <Check className="size-4" strokeWidth={3} />}
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="flex min-h-11 flex-1 flex-col items-start justify-center text-left"
        >
          <span
            className={cn(
              "text-sm font-medium",
              task.completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>
          {(task.streak > 0 || task.reminder_time) && (
            <span className="text-xs text-muted-foreground">
              {task.streak > 0 &&
                `${task.streak} ${task.streak === 1 ? "dag" : "dagen"} op rij`}
              {task.streak > 0 && task.reminder_time && " · "}
              {task.reminder_time && task.reminder_time.slice(0, 5)}
            </span>
          )}
        </button>
      </motion.div>
    </div>
  );
}
