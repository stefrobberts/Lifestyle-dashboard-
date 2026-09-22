"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, Lightbulb, ListTodo, Plus, Trash2 } from "lucide-react";
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
import { SearchInput } from "@/components/shared/SearchInput";
import { NoteFormSheet } from "@/components/werk/NoteFormSheet";
import {
  convertNoteToLinkedinIdea,
  convertNoteToTask,
  createNote,
  deleteNote,
  updateNote,
} from "@/app/(app)/werk/notities/actions";

export type NoteItem = {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
};

export function NotesSection({ initialNotes }: { initialNotes: NoteItem[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [convertCandidate, setConvertCandidate] = useState<NoteItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<NoteItem | null>(null);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q) ||
        note.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [notes, query]);

  function openCreateForm() {
    setEditingNote(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEditForm(note: NoteItem) {
    setEditingNote(note);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleConvert(kind: "task" | "linkedin") {
    if (!convertCandidate) return;
    const note = convertCandidate;
    setConvertCandidate(null);
    startTransition(async () => {
      const result =
        kind === "task"
          ? await convertNoteToTask(note.id)
          : await convertNoteToLinkedinIdea(note.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(kind === "task" ? "Omgezet naar taak" : "Omgezet naar LinkedIn-idee");
    });
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    const note = deleteCandidate;
    setDeleteCandidate(null);
    setNotes((current) => current.filter((n) => n.id !== note.id));
    startTransition(async () => {
      const result = await deleteNote(note.id);
      if (!result.success) {
        toast.error(result.error);
        setNotes((current) => [...current, note]);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Zoek in notities…" />

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {query ? "Niets gevonden." : "Nog geen notities."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <button
                type="button"
                onClick={() => openEditForm(note)}
                className="flex flex-col items-start gap-1 text-left"
              >
                <span className="text-sm font-medium">{note.title}</span>
                {note.content && (
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {note.content}
                  </span>
                )}
                {note.tags.length > 0 && (
                  <span className="flex flex-wrap gap-1 pt-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </span>
                )}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConvertCandidate(note)}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border text-xs font-medium text-muted-foreground"
                >
                  <ArrowRightLeft className="size-3.5" />
                  Omzetten
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(note)}
                  aria-label="Verwijderen"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
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
        Notitie toevoegen
      </Button>

      <NoteFormSheet
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editingNote ?? undefined}
        onSubmit={(formData) =>
          editingNote ? updateNote(editingNote.id, formData) : createNote(formData)
        }
        onDelete={
          editingNote
            ? () => {
                setFormOpen(false);
                setDeleteCandidate(editingNote);
              }
            : undefined
        }
      />

      <Drawer
        open={Boolean(convertCandidate)}
        onOpenChange={(open) => !open && setConvertCandidate(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Omzetten naar…</DrawerTitle>
            <DrawerDescription>
              &ldquo;{convertCandidate?.title}&rdquo; blijft ook als notitie bestaan.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 px-4 pb-4">
            <button
              type="button"
              onClick={() => handleConvert("task")}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-border px-4 text-left text-sm font-medium"
            >
              <ListTodo className="size-4 text-primary" />
              Werktaak
            </button>
            <button
              type="button"
              onClick={() => handleConvert("linkedin")}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-border px-4 text-left text-sm font-medium"
            >
              <Lightbulb className="size-4 text-primary" />
              LinkedIn-idee
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => !open && setDeleteCandidate(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notitie verwijderen?</DrawerTitle>
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
