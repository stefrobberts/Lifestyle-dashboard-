"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createSubtask,
  deleteSubtask,
  toggleSubtaskComplete,
} from "@/app/(app)/werk/actions";

type Priority = "hoog" | "normaal" | "laag";
type Recurrence = "geen" | "dagelijks" | "wekelijks" | "maandelijks";

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "laag", label: "Laag" },
  { value: "normaal", label: "Normaal" },
  { value: "hoog", label: "Hoog" },
];

const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: "geen", label: "Geen" },
  { value: "dagelijks", label: "Dagelijks" },
  { value: "wekelijks", label: "Wekelijks" },
  { value: "maandelijks", label: "Maandelijks" },
];

export type Subtask = { id: string; title: string; completed_at: string | null };

type FormState = { status: "idle" | "error"; message?: string };

export function TaskFormSheet({
  open,
  onOpenChange,
  categories,
  taskId,
  initialValues,
  initialSubtasks,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
  taskId?: string;
  initialValues?: {
    title: string;
    notes: string;
    deadline: string;
    priority: Priority;
    category_id: string;
    recurrence_type: Recurrence;
  };
  initialSubtasks?: Subtask[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onDelete?: () => void;
}) {
  const isEdit = Boolean(taskId);
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? "normaal");
  const [recurrence, setRecurrence] = useState<Recurrence>(
    initialValues?.recurrence_type ?? "geen"
  );
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? "");
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks ?? []);
  const [newSubtask, setNewSubtask] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      formData.set("priority", priority);
      formData.set("recurrence_type", recurrence);
      formData.set("category_id", categoryId);
      const result = await onSubmit(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      onOpenChange(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  async function handleAddSubtask() {
    if (!taskId || !newSubtask.trim()) return;
    const title = newSubtask.trim();
    setNewSubtask("");
    const formData = new FormData();
    formData.set("title", title);
    const result = await createSubtask(taskId, formData);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubtasks((current) => [
      ...current,
      { id: `temp-${Date.now()}`, title, completed_at: null },
    ]);
  }

  async function handleToggleSubtask(subtask: Subtask) {
    const completed = !subtask.completed_at;
    setSubtasks((current) =>
      current.map((s) =>
        s.id === subtask.id
          ? { ...s, completed_at: completed ? new Date().toISOString() : null }
          : s
      )
    );
    const result = await toggleSubtaskComplete(subtask.id, completed);
    if (!result.success) toast.error(result.error);
  }

  async function handleDeleteSubtask(subtaskId: string) {
    setSubtasks((current) => current.filter((s) => s.id !== subtaskId));
    const result = await deleteSubtask(subtaskId);
    if (!result.success) toast.error(result.error);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form action={formAction} className="flex max-h-[85vh] flex-col">
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Taak bewerken" : "Taak toevoegen"}</DrawerTitle>
            <DrawerDescription>
              Titel, deadline, prioriteit en eventueel een categorie.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={initialValues?.title}
                className="h-11 rounded-[12px] text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notitie (optioneel)</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={initialValues?.notes}
                className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-base outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="deadline">Deadline (optioneel)</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={initialValues?.deadline}
                className="h-11 rounded-[12px] text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Prioriteit</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      "min-h-11 rounded-[12px] border text-sm font-medium",
                      priority === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label>Categorie</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryId("")}
                    className={cn(
                      "min-h-9 rounded-full border px-3 text-sm font-medium",
                      categoryId === ""
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    Geen
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      className={cn(
                        "min-h-9 rounded-full border px-3 text-sm font-medium",
                        categoryId === category.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Herhaling</Label>
              <div className="grid grid-cols-4 gap-2">
                {RECURRENCES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRecurrence(option.value)}
                    className={cn(
                      "min-h-11 rounded-[12px] border px-1 text-xs font-medium",
                      recurrence === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isEdit && (
              <div className="flex flex-col gap-2">
                <Label>Subtaken</Label>
                {subtasks.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(subtask)}
                          aria-label={
                            subtask.completed_at
                              ? "Markeer als niet gedaan"
                              : "Markeer als gedaan"
                          }
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                            subtask.completed_at
                              ? "border-success bg-success text-white"
                              : "border-border"
                          )}
                        >
                          {subtask.completed_at && (
                            <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            subtask.completed_at && "text-muted-foreground line-through"
                          )}
                        >
                          {subtask.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          aria-label="Subtaak verwijderen"
                          className="flex size-8 items-center justify-center text-muted-foreground"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Nieuwe subtaak…"
                    className="h-11 flex-1 rounded-[12px] text-base"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSubtask}
                    aria-label="Subtaak toevoegen"
                    className="h-11 w-11 rounded-[12px] p-0"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {state.status === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-[12px] text-base"
            >
              {isPending ? "Bezig met opslaan…" : "Opslaan"}
            </Button>
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="h-11 gap-1.5 rounded-[12px] text-base text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Taak verwijderen
              </Button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
