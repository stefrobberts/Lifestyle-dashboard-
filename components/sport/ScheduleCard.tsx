"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Dumbbell, Pencil, Trash2 } from "lucide-react";
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
import { deleteSchedule } from "@/app/(app)/sport/schemas/actions";

export function ScheduleCard({
  id,
  title,
  exerciseCount,
}: {
  id: string;
  title: string;
  exerciseCount: number;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await deleteSchedule(id);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Dumbbell className="size-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {exerciseCount} {exerciseCount === 1 ? "oefening" : "oefeningen"}
        </p>
      </div>
      <Link
        href={`/sport/schemas/${id}/bewerken`}
        aria-label="Bewerken"
        className="flex size-11 items-center justify-center rounded-full text-muted-foreground"
      >
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Verwijderen"
        className="flex size-11 items-center justify-center rounded-full text-destructive"
      >
        <Trash2 className="size-4" />
      </button>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Schema verwijderen?</DrawerTitle>
            <DrawerDescription>
              &ldquo;{title}&rdquo; wordt permanent verwijderd.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
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
