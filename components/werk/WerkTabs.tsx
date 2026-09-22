import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/werk", label: "Taken" },
  { href: "/werk/linkedin", label: "LinkedIn" },
  { href: "/werk/notities", label: "Notities" },
  { href: "/werk/inbox", label: "Inbox" },
] as const;

export function WerkTabs({
  active,
  inboxCount,
}: {
  active: (typeof TABS)[number]["href"];
  inboxCount: number;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "relative flex min-h-9 shrink-0 items-center rounded-full border px-3 text-sm font-medium",
            active === tab.href
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground"
          )}
        >
          {tab.label}
          {tab.href === "/werk/inbox" && inboxCount > 0 && (
            <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {inboxCount > 9 ? "9+" : inboxCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
