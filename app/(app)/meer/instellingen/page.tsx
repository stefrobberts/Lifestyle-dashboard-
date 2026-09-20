import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ClearSampleRecipesButton } from "@/components/voeding/ClearSampleRecipesButton";
import { signOut } from "@/app/(app)/meer/instellingen/actions";

export default function InstellingenPage() {
  return (
    <div className="flex flex-col gap-8 px-4 pt-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Instellingen</h1>
        <p className="text-sm text-muted-foreground">
          Doelen, dagelijkse taken, notificaties en export komen in fase 8.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Thema
        </h2>
        <ThemeToggle />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Voorbeelddata
        </h2>
        <ClearSampleRecipesButton />
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-8 text-center text-muted-foreground">
        <Settings className="size-6" />
        <p className="text-sm">Meer instellingen volgen in een latere fase.</p>
      </div>

      <form action={signOut}>
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full gap-2 rounded-[12px] text-base text-destructive hover:text-destructive"
        >
          <LogOut className="size-4" />
          Uitloggen
        </Button>
      </form>
    </div>
  );
}
