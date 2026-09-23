"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
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
import { dateKey } from "@/lib/date";
import { createProgressPhoto } from "@/app/(app)/meer/metingen/fotos/actions";

type FormState = { status: "idle" | "error"; message?: string };

export function PhotoUploadSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createProgressPhoto(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      setPreview(null);
      onOpenChange(false);
      return { status: "idle" };
    },
    { status: "idle" }
  );

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form action={formAction}>
          <DrawerHeader>
            <DrawerTitle>Foto toevoegen</DrawerTitle>
            <DrawerDescription>Maak een progressiefoto of kies er een.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="flex flex-col items-center gap-3">
              <label
                htmlFor="photo"
                className="relative flex h-48 w-36 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground"
              >
                {preview ? (
                  <Image src={preview} alt="" fill sizes="144px" className="object-cover" />
                ) : (
                  <Camera className="size-8" />
                )}
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label htmlFor="photo" className="text-xs font-medium text-primary">
                {preview ? "Andere foto maken" : "Foto maken"}
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="taken_at">Datum</Label>
              <Input
                id="taken_at"
                name="taken_at"
                type="date"
                required
                defaultValue={dateKey(new Date())}
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
            <Button type="submit" disabled={isPending} className="h-11 rounded-[12px] text-base">
              {isPending ? "Bezig met opslaan…" : "Opslaan"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
