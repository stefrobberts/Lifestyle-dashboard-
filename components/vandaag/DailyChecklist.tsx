"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChecklistItem } from "@/components/vandaag/ChecklistItem";
import { ProgressRing } from "@/components/vandaag/ProgressRing";
import {
  TaskFormSheet,
  type TaskCategory,
  type TaskFormValues,
} from "@/components/vandaag/TaskFormSheet";
import { vibrate } from "@/lib/haptics";
import {
  createTask,
  deleteTask,
  setTaskCompletion,
  updateTask,
} from "@/app/(app)/vandaag/actions";

export type ChecklistTask = {
  id: string;
  title: string;
  category: TaskCategory;
  frequency_type: "daily" | "specific_days" | "every_x_days";
  specific_days: number[] | null;
  every_x_days: number | null;
  reminder_time: string | null;
  completed: boolean;
  streak: number;
};

const CATEGORY_GROUPS: { key: TaskCategory; label: string }[] = [
  { key: "supplement", label: "Supplementen" },
  { key: "verzorging", label: "Verzorging" },
  { key: "eigen", label: "Eigen taken" },
];

export function DailyChecklist({
  initialTasks,
  todayKey,
  autoOpenCreate = false,
}: {
  initialTasks: ChecklistTask[];
  todayKey: string;
  autoOpenCreate?: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const [, startTransition] = useTransition();
  // Bij het openen via de PWA-snelkoppeling (?actie=taak-toevoegen) staat het
  // formulier meteen open; autoOpenCreate verandert daarna niet meer.
  const [formOpen, setFormOpen] = useState(autoOpenCreate);
  const [formKey, setFormKey] = useState(0);
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ChecklistTask | null>(
    null
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  function handleToggle(task: ChecklistTask) {
    const nextCompleted = !task.completed;
    vibrate(nextCompleted ? 15 : 8);
    setTasks((current) =>
      current.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: nextCompleted,
              streak: nextCompleted ? t.streak + 1 : Math.max(0, t.streak - 1),
            }
          : t
      )
    );

    startTransition(async () => {
      const result = await setTaskCompletion(task.id, todayKey, nextCompleted);
      if (!result.success) {
        toast.error(result.error);
        setTasks((current) =>
          current.map((t) => (t.id === task.id ? task : t))
        );
      }
    });
  }

  function handleRequestDelete(task: ChecklistTask) {
    setDeleteCandidate(task);
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

  function openCreateForm() {
    setEditingTask(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEditForm(task: ChecklistTask) {
    setEditingTask(task);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  const formValues: TaskFormValues | undefined = editingTask
    ? {
        id: editingTask.id,
        title: editingTask.title,
        category: editingTask.category,
        frequency_type: editingTask.frequency_type,
        specific_days: editingTask.specific_days ?? [],
        every_x_days: editingTask.every_x_days,
        reminder_time: editingTask.reminder_time,
      }
    : undefined;

  return (
    <Card className="gap-4 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="font-heading text-lg">
            Dagelijkse checklist
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Supplementen, verzorging en je eigen taken.
          </p>
        </div>
        <ProgressRing completed={completedCount} total={tasks.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nog geen taken ingesteld. Voeg je eerste dagelijkse taak toe.
            </p>
          </div>
        ) : (
          CATEGORY_GROUPS.map((group) => {
            const groupTasks = tasks.filter((t) => t.category === group.key);
            if (groupTasks.length === 0) return null;
            return (
              <div key={group.key} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-2">
                  {groupTasks.map((task) => (
                    <ChecklistItem
                      key={task.id}
                      task={task}
                      onToggle={() => handleToggle(task)}
                      onRequestDelete={() => handleRequestDelete(task)}
                      onEdit={() => openEditForm(task)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        <Button
          type="button"
          variant="outline"
          onClick={openCreateForm}
          className="h-11 rounded-[12px] text-base"
        >
          <Plus className="size-4" />
          Taak toevoegen
        </Button>
      </CardContent>

      <TaskFormSheet
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={formValues}
        onSubmit={(formData) =>
          editingTask ? updateTask(editingTask.id, formData) : createTask(formData)
        }
        onDelete={
          editingTask
            ? () => {
                setFormOpen(false);
                handleRequestDelete(editingTask);
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
              &ldquo;{deleteCandidate?.title}&rdquo; wordt verwijderd, inclusief de
              opgebouwde streak. Dit kan niet ongedaan worden gemaakt.
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
    </Card>
  );
}
