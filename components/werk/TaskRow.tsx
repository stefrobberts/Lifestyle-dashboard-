"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Check, Clock, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { isOverdue } from "@/lib/work";
import { formatDutchDate } from "@/lib/date";

const SWIPE_THRESHOLD = 88;

export type TaskRowView = {
  id: string;
  title: string;
  deadline: string | null;
  priority: "hoog" | "normaal" | "laag";
  completed: boolean;
  recurrenceType: "geen" | "dagelijks" | "wekelijks" | "maandelijks";
  categoryName: string | null;
  subtaskProgress: { total: number; done: number } | null;
};

const PRIORITY_DOT: Record<TaskRowView["priority"], string> = {
  hoog: "bg-destructive",
  normaal: "bg-warning",
  laag: "bg-muted-foreground",
};

export function TaskRow({
  task,
  today,
  onToggle,
  onPostpone,
  onOpen,
}: {
  task: TaskRowView;
  today: Date;
  onToggle: () => void;
  onPostpone: () => void;
  onOpen: () => void;
}) {
  const x = useMotionValue(0);
  const completeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const postponeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const overdue = !task.completed && isOverdue(task.deadline, today);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onToggle();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onPostpone();
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
        style={{ opacity: postponeOpacity }}
        className="absolute inset-0 flex items-center justify-end rounded-2xl bg-warning/20 pr-5 text-warning"
      >
        <Clock className="size-5" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={task.completed ? "Markeer als niet gedaan" : "Markeer als gedaan"}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
            task.completed ? "border-success bg-success text-white" : "border-border"
          )}
        >
          {task.completed && <Check className="size-4" strokeWidth={3} />}
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-11 flex-1 flex-col items-start justify-center gap-0.5 text-left"
        >
          <span className="flex items-center gap-1.5">
            <span
              className={cn("size-1.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])}
            />
            <span
              className={cn(
                "text-sm font-medium",
                task.completed && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </span>
            {task.recurrenceType !== "geen" && (
              <Repeat className="size-3 shrink-0 text-muted-foreground" />
            )}
          </span>
          {(task.deadline || task.categoryName || task.subtaskProgress) && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {task.deadline && (
                <span className={cn(overdue && "font-medium text-destructive")}>
                  {overdue ? "Te laat · " : ""}
                  {formatDutchDate(new Date(`${task.deadline}T00:00:00`))}
                </span>
              )}
              {task.categoryName && <span>{task.categoryName}</span>}
              {task.subtaskProgress && (
                <span>
                  {task.subtaskProgress.done}/{task.subtaskProgress.total} subtaken
                </span>
              )}
            </span>
          )}
        </button>
      </motion.div>
    </div>
  );
}
