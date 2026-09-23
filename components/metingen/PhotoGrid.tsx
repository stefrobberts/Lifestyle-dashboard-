"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Images, Plus } from "lucide-react";
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
import { formatDutchDate } from "@/lib/date";
import { PhotoUploadSheet } from "@/components/metingen/PhotoUploadSheet";
import { PhotoCompareView, type ComparePhoto } from "@/components/metingen/PhotoCompareView";
import { deleteProgressPhoto } from "@/app/(app)/meer/metingen/fotos/actions";

export type PhotoItem = {
  id: string;
  url: string;
  photoPath: string;
  takenAt: string;
  weightKg: number | null;
};

const LONG_PRESS_MS = 500;

export function PhotoGrid({ initialPhotos }: { initialPhotos: PhotoItem[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<PhotoItem | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  function toggleSelect(photo: PhotoItem) {
    setSelectedIds((current) => {
      if (current.includes(photo.id)) return current.filter((id) => id !== photo.id);
      if (current.length >= 2) return [current[1], photo.id];
      return [...current, photo.id];
    });
  }

  function startLongPress(photo: PhotoItem) {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setDeleteCandidate(photo);
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleTap(photo: PhotoItem) {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    toggleSelect(photo);
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    const photo = deleteCandidate;
    setDeleteCandidate(null);
    setPhotos((current) => current.filter((p) => p.id !== photo.id));
    setSelectedIds((current) => current.filter((id) => id !== photo.id));
    deleteProgressPhoto(photo.id, photo.photoPath).then((result) => {
      if (!result.success) {
        toast.error(result.error);
        setPhotos((current) => [...current, photo]);
      }
    });
  }

  const selectedPhotos = selectedIds
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is PhotoItem => Boolean(p));

  const [olderPhoto, newerPhoto] =
    selectedPhotos.length === 2
      ? [...selectedPhotos].sort((a, b) => a.takenAt.localeCompare(b.takenAt))
      : [null, null];

  return (
    <div className="flex flex-col gap-4">
      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <Images className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nog geen progressiefoto&apos;s. Maak je eerste foto.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Tik op 2 foto&apos;s om te vergelijken. Lang indrukken om te verwijderen.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => {
              const selected = selectedIds.includes(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onPointerDown={() => startLongPress(photo)}
                  onPointerUp={cancelLongPress}
                  onPointerLeave={cancelLongPress}
                  onClick={() => handleTap(photo)}
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden rounded-2xl border-2",
                    selected ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                    <span className="text-[10px] font-medium text-white">
                      {formatDutchDate(new Date(`${photo.takenAt}T00:00:00`)).replace(/^\w+ /, "")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => setUploadOpen(true)}
        className="h-11 gap-1.5 rounded-[12px] text-base"
      >
        <Plus className="size-4" />
        Foto toevoegen
      </Button>

      {selectedPhotos.length === 2 && (
        <Button
          type="button"
          onClick={() => setComparing(true)}
          className="safe-bottom fixed inset-x-4 bottom-20 z-30 h-12 rounded-[12px] text-base shadow-lg"
        >
          Vergelijken
        </Button>
      )}

      <PhotoUploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />

      {comparing && olderPhoto && newerPhoto && (
        <PhotoCompareView
          before={toComparePhoto(olderPhoto)}
          after={toComparePhoto(newerPhoto)}
          onClose={() => setComparing(false)}
        />
      )}

      <Drawer
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => !open && setDeleteCandidate(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Foto verwijderen?</DrawerTitle>
            <DrawerDescription>Deze progressiefoto wordt permanent verwijderd.</DrawerDescription>
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
                <Button type="button" variant="ghost" className="h-11 rounded-[12px] text-base">
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

function toComparePhoto(photo: PhotoItem): ComparePhoto {
  return { url: photo.url, takenAt: photo.takenAt, weightKg: photo.weightKg };
}
