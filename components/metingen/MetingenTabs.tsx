import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/meer/metingen", label: "Overzicht" },
  { href: "/meer/metingen/fotos", label: "Foto's" },
] as const;

export function MetingenTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex min-h-9 shrink-0 items-center rounded-full border px-3 text-sm font-medium",
            active === tab.href
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
