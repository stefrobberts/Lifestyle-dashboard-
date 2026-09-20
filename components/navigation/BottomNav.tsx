"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, ListTodo, MoreHorizontal, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/vandaag", label: "Vandaag", icon: Home },
  { href: "/voeding", label: "Voeding", icon: Utensils },
  { href: "/sport", label: "Sport", icon: Dumbbell },
  { href: "/werk", label: "Werk", icon: ListTodo },
  { href: "/meer", label: "Meer", icon: MoreHorizontal },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
