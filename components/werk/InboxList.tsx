"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Lightbulb, ListTodo, StickyNote, Trash2 } from "lucide-react";
import {
  dismissInboxNote,
  processInboxNoteToLinkedinIdea,
  processInboxNoteToNote,
  processInboxNoteToTask,
} from "@/app/(app)/werk/inbox/actions";

export type InboxItem = { id: string; content: string; createdAt: string };

export function InboxList({ initialItems }: { initialItems: InboxItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();

  function handleAction(
    itemId: string,
    action: (id: string) => Promise<{ success: boolean; error?: string }>,
    successMessage: string
  ) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setItems((current) => current.filter((i) => i.id !== itemId));
    startTransition(async () => {
      const result = await action(itemId);
      if (!result.success) {
        toast.error(result.error);
        setItems((current) => [item, ...current]);
        return;
      }
      toast.success(successMessage);
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Niets in je Inbox. Lang indrukken op de snelle actieknop legt hier
          direct een notitie vast.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3"
        >
          <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() =>
                handleAction(item.id, processInboxNoteToTask, "Omgezet naar taak")
              }
              aria-label="Omzetten naar taak"
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[12px] border border-border text-muted-foreground"
            >
              <ListTodo className="size-4" />
              <span className="text-[10px]">Taak</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleAction(item.id, processInboxNoteToNote, "Omgezet naar notitie")
              }
              aria-label="Omzetten naar notitie"
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[12px] border border-border text-muted-foreground"
            >
              <StickyNote className="size-4" />
              <span className="text-[10px]">Notitie</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleAction(
                  item.id,
                  processInboxNoteToLinkedinIdea,
                  "Omgezet naar LinkedIn-idee"
                )
              }
              aria-label="Omzetten naar LinkedIn-idee"
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[12px] border border-border text-muted-foreground"
            >
              <Lightbulb className="size-4" />
              <span className="text-[10px]">LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={() => handleAction(item.id, dismissInboxNote, "Verwijderd")}
              aria-label="Verwijderen"
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[12px] border border-border text-destructive"
            >
              <Trash2 className="size-4" />
              <span className="text-[10px]">Wissen</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
