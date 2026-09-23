"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Camera,
  Dumbbell,
  Megaphone,
  ListTodo,
  NotebookPen,
  Plus,
  Scale,
  Sparkles,
  Utensils,
} from "lucide-react";
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
import { vibrate } from "@/lib/haptics";
import { dateKey } from "@/lib/date";
import { createInboxNote } from "@/components/quick-actions/actions";
import { LogFoodSheet } from "@/components/voeding/LogFoodSheet";
import { startTodaysWorkout } from "@/app/(app)/sport/actions";
import { createTask } from "@/app/(app)/werk/actions";
import { quickCreateLinkedinIdea } from "@/app/(app)/werk/linkedin/actions";
import { quickSaveWeight } from "@/app/(app)/meer/metingen/actions";
import { createProgressPhoto } from "@/app/(app)/meer/metingen/fotos/actions";

type Tile = {
  key: string;
  label: string;
  icon: typeof Utensils;
  matchPaths?: string[];
  functional: boolean;
};

const TILES: Tile[] = [
  { key: "maaltijd", label: "Maaltijd loggen", icon: Utensils, matchPaths: ["/voeding"], functional: true },
  { key: "workout", label: "Workout starten", icon: Dumbbell, matchPaths: ["/sport"], functional: true },
  { key: "gewicht", label: "Gewicht invoeren", icon: Scale, matchPaths: ["/meer/metingen"], functional: true },
  { key: "foto", label: "Progressiefoto maken", icon: Camera, matchPaths: ["/meer/metingen"], functional: true },
  { key: "werktaak", label: "Werktaak toevoegen", icon: ListTodo, matchPaths: ["/werk"], functional: true },
  { key: "linkedin", label: "LinkedIn idee", icon: Megaphone, matchPaths: ["/werk"], functional: true },
  { key: "notitie", label: "Notitie", icon: NotebookPen, functional: true },
  { key: "titel", label: "Titel toevoegen", icon: Sparkles, matchPaths: ["/meer/entertainment"], functional: false },
];

const LONG_PRESS_MS = 500;

type NoteState = { status: "idle" | "error"; message?: string };

export function QuickActionButton() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [mealSheetOpen, setMealSheetOpen] = useState(false);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [linkedinSheetOpen, setLinkedinSheetOpen] = useState(false);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const taskFormRef = useRef<HTMLFormElement>(null);
  const linkedinFormRef = useRef<HTMLFormElement>(null);
  const weightFormRef = useRef<HTMLFormElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [noteState, noteAction, notePending] = useActionState(
    async (_prev: NoteState, formData: FormData): Promise<NoteState> => {
      const result = await createInboxNote(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      toast.success("Opgeslagen in je inbox");
      formRef.current?.reset();
      setNoteOpen(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  const [taskState, taskAction, taskPending] = useActionState(
    async (_prev: NoteState, formData: FormData): Promise<NoteState> => {
      const result = await createTask(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      toast.success("Taak toegevoegd");
      taskFormRef.current?.reset();
      setTaskSheetOpen(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  const [linkedinState, linkedinAction, linkedinPending] = useActionState(
    async (_prev: NoteState, formData: FormData): Promise<NoteState> => {
      const result = await quickCreateLinkedinIdea(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      toast.success("Idee opgeslagen");
      linkedinFormRef.current?.reset();
      setLinkedinSheetOpen(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  const [weightState, weightAction, weightPending] = useActionState(
    async (_prev: NoteState, formData: FormData): Promise<NoteState> => {
      const result = await quickSaveWeight(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      toast.success("Gewicht opgeslagen");
      weightFormRef.current?.reset();
      setWeightSheetOpen(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.set("photo", file);
    const result = await createProgressPhoto(formData);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Foto opgeslagen");
  }

  const orderedTiles = useMemo(() => {
    const withPriority = TILES.map((tile) => ({
      tile,
      priority: tile.matchPaths?.some((path) => pathname.startsWith(path))
        ? 0
        : 1,
    }));
    return withPriority
      .sort((a, b) => a.priority - b.priority)
      .map(({ tile }) => tile);
  }, [pathname]);

  function startLongPress() {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      vibrate(20);
      setNoteOpen(true);
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleClick() {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    setSheetOpen(true);
  }

  function handleTileClick(tile: Tile) {
    if (!tile.functional) return;
    setSheetOpen(false);
    if (tile.key === "notitie") {
      setNoteOpen(true);
    }
    if (tile.key === "maaltijd") {
      setMealSheetOpen(true);
    }
    if (tile.key === "workout") {
      startTodaysWorkout();
    }
    if (tile.key === "werktaak") {
      setTaskSheetOpen(true);
    }
    if (tile.key === "linkedin") {
      setLinkedinSheetOpen(true);
    }
    if (tile.key === "gewicht") {
      setWeightSheetOpen(true);
    }
    if (tile.key === "foto") {
      photoInputRef.current?.click();
    }
  }

  return (
    <>
      <Button
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onClick={handleClick}
        aria-label="Snelle actie"
        className="safe-bottom fixed right-5 bottom-20 z-40 size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
      >
        <Plus className="size-6" />
      </Button>

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Snelle actie</DrawerTitle>
            <DrawerDescription>
              Kies wat je wilt vastleggen. Lang indrukken op de knop opent
              direct een notitie.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {orderedTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.key}
                  type="button"
                  disabled={!tile.functional}
                  onClick={() => handleTileClick(tile)}
                  className={cn(
                    "relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 text-center text-sm font-medium transition-colors",
                    tile.functional
                      ? "hover:border-primary/40 hover:bg-primary/5 active:bg-primary/10"
                      : "opacity-50"
                  )}
                >
                  <Icon className="size-6 text-primary" />
                  {tile.label}
                  {!tile.functional && (
                    <span className="absolute top-2 right-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
                      binnenkort
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={noteOpen} onOpenChange={setNoteOpen}>
        <DrawerContent>
          <form ref={formRef} action={noteAction}>
            <DrawerHeader>
              <DrawerTitle>Snelle notitie</DrawerTitle>
              <DrawerDescription>
                Komt in je Inbox terecht, zodat je het later kunt sorteren.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <textarea
                name="content"
                autoFocus
                required
                rows={4}
                placeholder="Typ je notitie…"
                className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-base outline-none focus:border-primary"
              />
              {noteState.status === "error" && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {noteState.message}
                </p>
              )}
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={notePending}
                className="h-11 rounded-[12px] text-base"
              >
                {notePending ? "Bezig met opslaan…" : "Opslaan in inbox"}
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
          </form>
        </DrawerContent>
      </Drawer>

      <LogFoodSheet
        open={mealSheetOpen}
        onOpenChange={setMealSheetOpen}
        entryDate={dateKey(new Date())}
      />

      <Drawer open={taskSheetOpen} onOpenChange={setTaskSheetOpen}>
        <DrawerContent>
          <form ref={taskFormRef} action={taskAction}>
            <input type="hidden" name="priority" value="normaal" />
            <input type="hidden" name="recurrence_type" value="geen" />
            <DrawerHeader>
              <DrawerTitle>Werktaak toevoegen</DrawerTitle>
              <DrawerDescription>
                Details zoals deadline en categorie kun je later toevoegen in Werk.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <input
                name="title"
                autoFocus
                required
                placeholder="Titel van de taak…"
                className="h-11 w-full rounded-[12px] border border-border bg-background px-3 text-base outline-none focus:border-primary"
              />
              {taskState.status === "error" && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {taskState.message}
                </p>
              )}
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={taskPending}
                className="h-11 rounded-[12px] text-base"
              >
                {taskPending ? "Bezig met opslaan…" : "Taak toevoegen"}
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
          </form>
        </DrawerContent>
      </Drawer>

      <Drawer open={linkedinSheetOpen} onOpenChange={setLinkedinSheetOpen}>
        <DrawerContent>
          <form ref={linkedinFormRef} action={linkedinAction}>
            <DrawerHeader>
              <DrawerTitle>LinkedIn-idee vastleggen</DrawerTitle>
              <DrawerDescription>
                Ook prima als het maar één zin is. De rest werk je later uit.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <input
                name="subject"
                autoFocus
                required
                placeholder="Waar gaat het idee over?"
                className="h-11 w-full rounded-[12px] border border-border bg-background px-3 text-base outline-none focus:border-primary"
              />
              {linkedinState.status === "error" && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {linkedinState.message}
                </p>
              )}
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={linkedinPending}
                className="h-11 rounded-[12px] text-base"
              >
                {linkedinPending ? "Bezig met opslaan…" : "Idee opslaan"}
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
          </form>
        </DrawerContent>
      </Drawer>

      <Drawer open={weightSheetOpen} onOpenChange={setWeightSheetOpen}>
        <DrawerContent>
          <form ref={weightFormRef} action={weightAction}>
            <DrawerHeader>
              <DrawerTitle>Gewicht invoeren</DrawerTitle>
              <DrawerDescription>
                Vetpercentage en omtrekken kun je later toevoegen in Metingen.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <div className="relative">
                <input
                  name="weight_kg"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0}
                  autoFocus
                  required
                  placeholder="0,0"
                  className="h-11 w-full rounded-[12px] border border-border bg-background px-3 pr-10 text-base outline-none focus:border-primary"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                  kg
                </span>
              </div>
              {weightState.status === "error" && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {weightState.message}
                </p>
              )}
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={weightPending}
                className="h-11 rounded-[12px] text-base"
              >
                {weightPending ? "Bezig met opslaan…" : "Gewicht opslaan"}
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
          </form>
        </DrawerContent>
      </Drawer>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />
    </>
  );
}
