"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { vibrate } from "@/lib/haptics";

const STORAGE_KEY = "rest-timer-ends-at";
const DEFAULT_SECONDS = 90;
const STEP_SECONDS = 15;

function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Web Audio niet beschikbaar: geen geluid, geen probleem.
  }
}

export function useRestTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    // Bewust pas na mount lezen: localStorage bestaat niet tijdens SSR, en
    // meteen tijdens de render lezen zou een hydration-mismatch geven zodra
    // er een lopende timer is opgeslagen.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed > Date.now()) setEndsAt(parsed);
      else localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const tick = useCallback(() => {
    setEndsAt((current) => {
      if (!current) return current;
      const left = Math.max(0, Math.round((current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !hasFinishedRef.current) {
        hasFinishedRef.current = true;
        vibrate([100, 60, 100]);
        playBeep();
        localStorage.removeItem(STORAGE_KEY);
      }
      return current;
    });
  }, []);

  useEffect(() => {
    if (!endsAt) return;
    tick();
    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [endsAt, tick]);

  function start(seconds: number = DEFAULT_SECONDS) {
    hasFinishedRef.current = false;
    const target = Date.now() + seconds * 1000;
    localStorage.setItem(STORAGE_KEY, String(target));
    setEndsAt(target);
    setRemaining(seconds);
  }

  function adjust(deltaSeconds: number) {
    setEndsAt((current) => {
      if (!current) return current;
      const target = Math.max(Date.now(), current + deltaSeconds * 1000);
      localStorage.setItem(STORAGE_KEY, String(target));
      return target;
    });
  }

  function stop() {
    localStorage.removeItem(STORAGE_KEY);
    setEndsAt(null);
    setRemaining(0);
  }

  return { isRunning: endsAt !== null && remaining > 0, remaining, start, adjust, stop };
}

export function RestTimer({
  remaining,
  onAdjust,
  onStop,
}: {
  remaining: number;
  onAdjust: (deltaSeconds: number) => void;
  onStop: () => void;
}) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-4 z-30 mx-4 flex items-center justify-between rounded-2xl border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={() => onAdjust(-STEP_SECONDS)}
        aria-label="15 seconden korter"
        className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground"
      >
        <Minus className="size-5" />
      </button>
      <div className="flex flex-col items-center">
        <span className="font-heading text-2xl font-bold tabular-nums">
          {minutes}:{String(seconds).padStart(2, "0")}
        </span>
        <span className="text-[11px] text-muted-foreground">rust</span>
      </div>
      <button
        type="button"
        onClick={() => onAdjust(STEP_SECONDS)}
        aria-label="15 seconden langer"
        className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground"
      >
        <Plus className="size-5" />
      </button>
      <button
        type="button"
        onClick={onStop}
        aria-label="Timer stoppen"
        className="ml-1 flex size-11 items-center justify-center rounded-full text-muted-foreground"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
