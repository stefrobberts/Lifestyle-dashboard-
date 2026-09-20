"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

/** Voorkomt een hydration mismatch: pas na het mounten weten we het actieve thema. */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const options = [
    { value: "dark", label: "Donker", icon: Moon },
    { value: "light", label: "Licht", icon: Sun },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isActive = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-[12px] border px-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            <option.icon className="size-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
