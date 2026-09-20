"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current ?? undefined,
        (result) => {
          if (result && !cancelled) {
            onDetected(result.getText());
          }
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Kon de camera niet openen. Controleer of je toestemming hebt gegeven."
          );
        }
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="safe-top flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-white">Scan een barcode</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-64 rounded-2xl border-2 border-primary/80" />
        </div>
      </div>

      <div className="safe-bottom flex flex-col items-center gap-3 px-6 py-6">
        {error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-center text-sm text-white/70">
            Richt de camera op de barcode.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-11 w-full rounded-[12px] text-base"
        >
          Annuleren
        </Button>
      </div>
    </div>
  );
}
