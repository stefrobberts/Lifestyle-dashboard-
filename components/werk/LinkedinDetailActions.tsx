"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteLinkedinIdea, setLinkedinIdeaStatus } from "@/app/(app)/werk/linkedin/actions";

type Status = "idee" | "concept" | "gepland" | "gepubliceerd";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "idee", label: "Idee" },
  { value: "concept", label: "Concept" },
  { value: "gepland", label: "Gepland" },
  { value: "gepubliceerd", label: "Gepubliceerd" },
];

export function LinkedinDetailActions({
  ideaId,
  subject,
  status,
}: {
  ideaId: string;
  subject: string;
  status: Status;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleStatusChange(next: Status) {
    setCurrentStatus(next);
    startTransition(async () => {
      const result = await setLinkedinIdeaStatus(ideaId, next);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await deleteLinkedinIdea(ideaId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Idee verwijderd");
      router.push("/werk/linkedin");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleStatusChange(option.value)}
            className={cn(
              "min-h-11 rounded-[12px] border px-1 text-xs font-medium",
              currentStatus === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/werk/linkedin/${ideaId}/bewerken`}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-border text-sm font-medium text-muted-foreground"
        >
          <Pencil className="size-4" />
          Bewerken
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-border text-sm font-medium text-destructive"
        >
          <Trash2 className="size-4" />
          Verwijderen
        </button>
      </div>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Idee verwijderen?</DrawerTitle>
            <DrawerDescription>
              &ldquo;{subject}&rdquo; wordt permanent verwijderd.
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
