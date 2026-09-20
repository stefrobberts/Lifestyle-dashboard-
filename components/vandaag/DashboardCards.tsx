"use client";

import { useState, useTransition } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Scale, Settings2, Sparkles, Utensils, Dumbbell, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ModulePlaceholderCard } from "@/components/vandaag/ModulePlaceholderCard";
import { setCardOrder, setCardVisibility } from "@/app/(app)/vandaag/actions";

export type CardKey = "voeding" | "sport" | "werk" | "verzorging" | "gewicht";

export type CardPref = {
  card_key: CardKey;
  sort_order: number;
  is_visible: boolean;
};

const CARD_META: Record<CardKey, { label: string; description: string; icon: LucideIcon }> = {
  voeding: {
    label: "Voeding",
    description: "Dagboek en calorieën volgen vanaf fase 2",
    icon: Utensils,
  },
  sport: {
    label: "Sport",
    description: "Schema's en workouts vanaf fase 3",
    icon: Dumbbell,
  },
  werk: {
    label: "Werk",
    description: "Taken en ideeën vanaf fase 4",
    icon: ListTodo,
  },
  verzorging: {
    label: "Verzorging",
    description: "Afspraken en routines vanaf fase 6",
    icon: Sparkles,
  },
  gewicht: {
    label: "Gewichtsverloop",
    description: "Grafiek van de laatste 30 dagen vanaf fase 5",
    icon: Scale,
  },
};

function ManageRow({
  pref,
  onVisibilityChange,
}: {
  pref: CardPref;
  onVisibilityChange: (cardKey: CardKey, visible: boolean) => void;
}) {
  const meta = CARD_META[pref.card_key];
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={pref}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Versleep om te herordenen"
        className="flex size-11 shrink-0 items-center justify-center text-muted-foreground"
      >
        <GripVertical className="size-5" />
      </button>
      <meta.icon className="size-5 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">{meta.label}</span>
      <Switch
        checked={pref.is_visible}
        onCheckedChange={(checked) => onVisibilityChange(pref.card_key, checked)}
        aria-label={`${meta.label} kaart tonen`}
      />
    </Reorder.Item>
  );
}

export function DashboardCards({ initialCards }: { initialCards: CardPref[] }) {
  const [cards, setCards] = useState(initialCards);
  const [prevInitialCards, setPrevInitialCards] = useState(initialCards);
  if (initialCards !== prevInitialCards) {
    setPrevInitialCards(initialCards);
    setCards(initialCards);
  }

  const [manageOpen, setManageOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleVisibilityChange(cardKey: CardKey, visible: boolean) {
    setCards((current) =>
      current.map((c) => (c.card_key === cardKey ? { ...c, is_visible: visible } : c))
    );
    startTransition(async () => {
      const result = await setCardVisibility(cardKey, visible);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleReorder(newOrder: CardPref[]) {
    setCards(newOrder);
    startTransition(async () => {
      const result = await setCardOrder(
        newOrder.map((c, index) => ({ card_key: c.card_key, sort_order: index }))
      );
      if (!result.success) toast.error(result.error);
    });
  }

  const visibleCards = cards.filter((c) => c.is_visible);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-heading text-base font-semibold">Overzicht</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setManageOpen(true)}
          className="h-9 gap-1.5 rounded-[12px] text-muted-foreground"
        >
          <Settings2 className="size-4" />
          Kaarten aanpassen
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {visibleCards.map((card) => {
          const meta = CARD_META[card.card_key];
          return (
            <ModulePlaceholderCard
              key={card.card_key}
              icon={meta.icon}
              title={meta.label}
              description={meta.description}
            />
          );
        })}
      </div>

      <Drawer open={manageOpen} onOpenChange={setManageOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Kaarten aanpassen</DrawerTitle>
            <DrawerDescription>
              Versleep om de volgorde te wijzigen en zet kaarten aan of uit.
            </DrawerDescription>
          </DrawerHeader>
          <Reorder.Group
            axis="y"
            values={cards}
            onReorder={handleReorder}
            className="flex flex-col gap-2 px-4 pb-4"
          >
            {cards.map((pref) => (
              <ManageRow
                key={pref.card_key}
                pref={pref}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </Reorder.Group>
          <DrawerFooter>
            <DrawerClose
              render={
                <Button type="button" className="h-11 rounded-[12px] text-base">
                  Klaar
                </Button>
              }
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
