"use client";

import { useActionState } from "react";
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

type FormState = { status: "idle" | "error"; message?: string };

export function NoteFormSheet({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: { title: string; content: string | null; tags: string[] };
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onDelete?: () => void;
}) {
  const isEdit = Boolean(initialValues);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await onSubmit(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      onOpenChange(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form action={formAction}>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Notitie bewerken" : "Notitie toevoegen"}</DrawerTitle>
            <DrawerDescription>Losse werknotitie of idee.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
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
              <Label htmlFor="content">Inhoud</Label>
              <textarea
                id="content"
                name="content"
                rows={6}
                defaultValue={initialValues?.content ?? undefined}
                className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-base outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Tags (met komma&apos;s)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={initialValues?.tags.join(", ")}
                className="h-11 rounded-[12px] text-base"
              />
            </div>
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
                className="h-11 rounded-[12px] text-base text-destructive hover:text-destructive"
              >
                Notitie verwijderen
              </Button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
