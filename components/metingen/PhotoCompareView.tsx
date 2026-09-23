"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "framer-motion";
import { X, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDutchDate } from "@/lib/date";

export type ComparePhoto = { url: string; takenAt: string; weightKg: number | null };

type Mode = "schuif" | "overlay";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function PhotoLabel({ photo, side }: { photo: ComparePhoto; side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      {formatDutchDate(new Date(`${photo.takenAt}T00:00:00`))}
      {photo.weightKg !== null && ` · ${photo.weightKg.toLocaleString("nl-NL")} kg`}
    </div>
  );
}

export function PhotoCompareView({
  before,
  after,
  onClose,
}: {
  before: ComparePhoto;
  after: ComparePhoto;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("schuif");
  const [sliderPercent, setSliderPercent] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function handlePan(_: unknown, info: PanInfo) {
    const width = containerRef.current?.offsetWidth ?? 1;
    setSliderPercent((current) => clamp(current + (info.delta.x / width) * 100, 0, 100));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="safe-top flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="flex size-11 items-center justify-center rounded-full text-muted-foreground"
        >
          <X className="size-5" />
        </button>
        <div className="flex gap-2 rounded-full border border-border p-1">
          {(["schuif", "overlay"] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "min-h-8 rounded-full px-3 text-xs font-medium capitalize",
                mode === option ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="size-11" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-4">
        <div
          ref={containerRef}
          className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-muted"
        >
          <Image src={after.url} alt="" fill sizes="400px" className="object-cover" />

          {mode === "overlay" ? (
            <div className="absolute inset-0" style={{ opacity: overlayOpacity / 100 }}>
              <Image src={before.url} alt="" fill sizes="400px" className="object-cover" />
            </div>
          ) : (
            <>
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPercent}%` }}
              >
                <div className="relative h-full" style={{ width: containerWidth || "100vw" }}>
                  <Image src={before.url} alt="" fill sizes="400px" className="object-cover" />
                </div>
              </div>
              <motion.div
                onPan={handlePan}
                className="absolute inset-y-0 z-10 flex w-10 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center"
                style={{ left: `${sliderPercent}%` }}
              >
                <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white" />
                <div className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
                  <MoveHorizontal className="size-4" />
                </div>
              </motion.div>
            </>
          )}

          <PhotoLabel photo={before} side="left" />
          <PhotoLabel photo={after} side="right" />
        </div>
      </div>

      {mode === "overlay" && (
        <div className="safe-bottom flex flex-col gap-2 px-6 pb-8">
          <span className="text-center text-xs text-muted-foreground">
            Sleep om {before.takenAt < after.takenAt ? "de oudste" : "de nieuwste"} foto meer of
            minder te laten zien
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="h-11 w-full accent-primary"
          />
        </div>
      )}
    </div>
  );
}
