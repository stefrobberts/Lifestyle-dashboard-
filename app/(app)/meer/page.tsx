import Link from "next/link";
import { ChevronRight, Ruler, Settings, Sparkles, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ITEMS: { href: string; label: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/meer/metingen",
    label: "Metingen",
    description: "Gewicht, omtrekken en progressiefoto's",
    icon: Ruler,
  },
  {
    href: "/meer/entertainment",
    label: "Entertainment",
    description: "Series, films, boeken en podcasts",
    icon: Tv,
  },
  {
    href: "/meer/verzorging",
    label: "Verzorging",
    description: "Terugkerende afspraken en routines",
    icon: Sparkles,
  },
  {
    href: "/meer/instellingen",
    label: "Instellingen",
    description: "Doelen, notificaties, thema en export",
    icon: Settings,
  },
];

export default function MeerPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Meer</h1>

      <div className="flex flex-col gap-3">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-16 items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <item.icon className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
