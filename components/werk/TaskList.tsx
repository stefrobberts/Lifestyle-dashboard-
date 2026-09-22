"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { categorizeTaskByDeadline, type TaskView } from "@/lib/work";
import { TaskRow, type TaskRowView } from "@/components/werk/TaskRow";
import { TaskFormSheet, type Subtask } from "@/components/werk/TaskFormSheet";
import {
  createTask,
  deleteTask,
  getTaskSubtasks,
  postponeTask,
  toggleTaskComplete,
  updateTask,
} from "@/app/(app)/werk/actions";

export type TaskListItem = TaskRowView & {
  notes: string | null;
  categoryId: string | null;
};

const TAB_LABELS: { value: TaskView | "afgerond"; label: string }[] = [
  { value: "vandaag", label: "Vandaag" },
  { value: "deze-week", label: "Deze week" },
  { value: "later", label: "Later" },
  { value: "afgerond", label: "Afgerond" },
];

export function TaskList({
  initialTasks,
  categories,
  todayKey,
}: {
  initialTasks: TaskListItem[];
  categories: { id: string; name: string }[];
  todayKey: string;
}) {
  const [tab, setTab] = useState<TaskView | "afgerond">("vandaag");
  const [tasks, setTasks] = useState(initialTasks);
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const [, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [editingSubtasks, setEditingSubtasks] = useState<Subtask[]>([]);
  const [deleteCandidate, setDeleteCandidate] = useState<TaskListItem | null>(null);

  const today = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey]);

  const visibleTasks = tasks.filter((task) => {
    if (tab === "afgerond") return task.completed;
    if (task.completed) return false;
    return categorizeTaskByDeadline(task.deadline, today) === tab;
  });

  function handleToggle(task: TaskListItem) {
    const nextCompleted = !task.completed;
    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );
    startTransition(async () => {
      const result = await toggleTaskComplete(task.id, nextCompleted);
      if (!result.success) {
        toast.error(result.error);
        setTasks((current) =>
          current.map((t) => (t.id === task.id ? task : t))
        );
      } else if (nextCompleted && task.recurrenceType !== "geen") {
        toast.success("Voltooid. De volgende taak staat al klaar.");
      }
    });
  }

  function handlePostpone(task: TaskListItem) {
    setTasks((current) => current.filter((t) => t.id !== task.id));
    startTransition(async () => {
      const result = await postponeTask(task.id);
      if (!result.success) {
        toast.error(result.error);
        setTasks((current) => [...current, task]);
      } else {
        toast.success("Uitgesteld naar morgen");
      }
    });
  }

  async function handleOpenTask(task: TaskListItem) {
    setEditingTask(task);
    setFormKey((k) => k + 1);
    const subtasks = await getTaskSubtasks(task.id);
    setEditingSubtasks(subtasks);
    setFormOpen(true);
  }

  function openCreateForm() {
    setEditingTask(null);
    setEditingSubtasks([]);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    const task = deleteCandidate;
    setDeleteCandidate(null);
    setTasks((current) => current.filter((t) => t.id !== task.id));
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (!result.success) {
        toast.error(result.error);
        setTasks((current) => [...current, task]);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {TAB_LABELS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "min-h-9 shrink-0 rounded-full border px-3 text-sm font-medium",
              tab === t.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {tab === "afgerond"
              ? "Nog niets afgerond in deze weergave."
              : "Niets hier. Mooi rustig, of tijd om iets toe te voegen."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              today={today}
              onToggle={() => handleToggle(task)}
              onPostpone={() => handlePostpone(task)}
              onOpen={() => handleOpenTask(task)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={openCreateForm}
        className="h-11 gap-1.5 rounded-[12px] text-base"
      >
        <Plus className="size-4" />
        Taak toevoegen
      </Button>

      <TaskFormSheet
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories}
        taskId={editingTask?.id}
        initialSubtasks={editingSubtasks}
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                notes: editingTask.notes ?? "",
                deadline: editingTask.deadline ?? "",
                priority: editingTask.priority,
                category_id: editingTask.categoryId ?? "",
                recurrence_type: editingTask.recurrenceType,
              }
            : undefined
        }
        onSubmit={(formData) =>
          editingTask ? updateTask(editingTask.id, formData) : createTask(formData)
        }
        onDelete={
          editingTask
            ? () => {
                setFormOpen(false);
                setDeleteCandidate(editingTask);
              }
            : undefined
        }
      />

      <Drawer
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => !open && setDeleteCandidate(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Taak verwijderen?</DrawerTitle>
            <DrawerDescription>
              &ldquo;{deleteCandidate?.title}&rdquo; wordt permanent verwijderd.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="h-11 rounded-[12px] text-base"
            >
              Verwijderen
            </Button>
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-[12px] text-base"
                >
                  Annuleren
                </Button>
              }
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
