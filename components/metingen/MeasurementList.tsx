"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeasurementRow, type MeasurementRowView } from "@/components/metingen/MeasurementRow";
import { MeasurementFormSheet } from "@/components/metingen/MeasurementFormSheet";
import { saveMeasurement, deleteMeasurement } from "@/app/(app)/meer/metingen/actions";

export type MeasurementListItem = MeasurementRowView & { notes: string | null };

export function MeasurementList({
  initialMeasurements,
}: {
  initialMeasurements: MeasurementListItem[];
}) {
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [prevInitial, setPrevInitial] = useState(initialMeasurements);
  if (initialMeasurements !== prevInitial) {
    setPrevInitial(initialMeasurements);
    setMeasurements(initialMeasurements);
  }

  const [, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<MeasurementListItem | null>(null);

  function openCreateForm() {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEditForm(measurement: MeasurementListItem) {
    setEditing(measurement);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleDelete(measurement: MeasurementListItem) {
    setMeasurements((current) => current.filter((m) => m.id !== measurement.id));
    startTransition(async () => {
      const result = await deleteMeasurement(measurement.id);
      if (!result.success) {
        toast.error(result.error);
        setMeasurements((current) => [...current, measurement]);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {measurements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen metingen. Vul je eerste meting in.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {measurements.map((measurement) => (
            <MeasurementRow
              key={measurement.id}
              measurement={measurement}
              onOpen={() => openEditForm(measurement)}
              onDelete={() => handleDelete(measurement)}
            />
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
        Meting invoeren
      </Button>

      <MeasurementFormSheet
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editing ?? undefined}
        onSubmit={saveMeasurement}
        onDelete={
          editing
            ? () => {
                setFormOpen(false);
                handleDelete(editing);
              }
            : undefined
        }
      />
    </div>
  );
}
