"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Status = "idee" | "concept" | "gepland" | "gepubliceerd";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "idee", label: "Idee" },
  { value: "concept", label: "Concept" },
  { value: "gepland", label: "Gepland" },
  { value: "gepubliceerd", label: "Gepubliceerd" },
];

type FormState = { status: "idle" | "error"; message?: string };

export function LinkedinIdeaForm({
  mode,
  initialValues,
  action,
}: {
  mode: "create" | "edit";
  initialValues?: {
    subject: string;
    hook: string;
    body: string;
    tags: string[];
    status: Status;
    plannedDate: string;
    imageUrl: string | null;
  };
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [status, setStatus] = useState<Status>(initialValues?.status ?? "idee");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.imageUrl ?? null
  );

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      formData.set("status", status);
      const result = await action(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      return { status: "idle" };
    },
    { status: "idle" }
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 px-4 pb-24">
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Onderwerp</Label>
        <Input
          id="subject"
          name="subject"
          required
          defaultValue={initialValues?.subject}
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="hook">Hook (openingszin)</Label>
        <Input
          id="hook"
          name="hook"
          defaultValue={initialValues?.hook}
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Uitwerking</Label>
        <textarea
          id="body"
          name="body"
          rows={8}
          defaultValue={initialValues?.body}
          className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-base outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags (met komma&apos;s)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={initialValues?.tags.join(", ")}
          placeholder="ai, productiviteit"
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <div className="grid grid-cols-4 gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={cn(
                "min-h-11 rounded-[12px] border px-1 text-xs font-medium",
                status === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="planned_date">Geplande datum (optioneel)</Label>
        <Input
          id="planned_date"
          name="planned_date"
          type="date"
          defaultValue={initialValues?.plannedDate}
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <label
          htmlFor="image"
          className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground"
        >
          {imagePreview ? (
            <Image src={imagePreview} alt="" fill sizes="100vw" className="object-cover" />
          ) : (
            <Camera className="size-8" />
          )}
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
        />
        <label htmlFor="image" className="text-xs font-medium text-primary">
          {imagePreview ? "Andere afbeelding kiezen" : "Afbeelding toevoegen (optioneel)"}
        </label>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-[12px] text-base"
      >
        {isPending
          ? "Bezig met opslaan…"
          : mode === "create"
            ? "Idee opslaan"
            : "Wijzigingen opslaan"}
      </Button>
    </form>
  );
}
