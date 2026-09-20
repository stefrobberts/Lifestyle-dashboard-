"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Barcode, Plus, Search, Star } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  cacheOffSearchResult,
  createCustomProduct,
  searchProducts,
  type SearchResultProduct,
} from "@/lib/data/products";
import {
  searchRecipes,
  type RecipeSearchResult,
} from "@/app/(app)/voeding/recepten/actions";
import { logProduct, logRecipe } from "@/app/(app)/voeding/actions";
import { BarcodeScanner } from "@/components/voeding/BarcodeScanner";

type MealType = "ontbijt" | "lunch" | "diner" | "snack";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "ontbijt", label: "Ontbijt" },
  { value: "lunch", label: "Lunch" },
  { value: "diner", label: "Diner" },
  { value: "snack", label: "Snack" },
];

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "ontbijt";
  if (hour < 15) return "lunch";
  if (hour < 21) return "diner";
  return "snack";
}

type Selection =
  | { type: "product"; product: SearchResultProduct }
  | { type: "recipe"; recipe: RecipeSearchResult };

export function LogFoodSheet({
  open,
  onOpenChange,
  entryDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryDate: string;
}) {
  const [tab, setTab] = useState<"producten" | "recepten">("producten");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchResultProduct[]>([]);
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setQuery("");
      setProducts([]);
      setRecipes([]);
      setSelection(null);
      setShowCustomForm(false);
      setTab("producten");
    }
  }

  useEffect(() => {
    if (!open || selection) return;
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        if (tab === "producten") {
          setProducts(await searchProducts(query));
        } else {
          setRecipes(await searchRecipes(query));
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, tab, open, selection]);

  async function handleBarcodeDetected(barcode: string) {
    setScanning(false);
    const result = await cacheOffSearchResult({
      id: null,
      off_barcode: barcode,
      name: "",
      brand: null,
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 0,
      is_favorite: false,
      is_off: true,
    });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    const found = await searchProducts(barcode);
    const match = found.find((p) => p.id === result.data.productId);
    setSelection({
      type: "product",
      product: match ?? {
        id: result.data.productId,
        off_barcode: barcode,
        name: "Gescand product",
        brand: null,
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        is_favorite: false,
        is_off: true,
      },
    });
  }

  function close() {
    onOpenChange(false);
  }

  if (scanning) {
    return (
      <BarcodeScanner
        onDetected={handleBarcodeDetected}
        onClose={() => setScanning(false)}
      />
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {selection ? (
          <QuantityStep
            selection={selection}
            entryDate={entryDate}
            isPending={isPending}
            onBack={() => setSelection(null)}
            onSubmit={(formData, kind) => {
              startTransition(async () => {
                const result =
                  kind === "product"
                    ? await logProduct(formData)
                    : await logRecipe(formData);
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Toegevoegd aan je dagboek");
                close();
              });
            }}
          />
        ) : showCustomForm ? (
          <CustomProductStep
            initialName={query}
            isPending={isPending}
            onBack={() => setShowCustomForm(false)}
            onCreated={(product) =>
              setSelection({ type: "product", product })
            }
            startTransition={startTransition}
          />
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle>Maaltijd loggen</DrawerTitle>
              <DrawerDescription>
                Zoek een product of kies een van je recepten.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-3 px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTab("producten")}
                  className={cn(
                    "min-h-11 rounded-[12px] border text-sm font-medium",
                    tab === "producten"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Producten
                </button>
                <button
                  type="button"
                  onClick={() => setTab("recepten")}
                  className={cn(
                    "min-h-11 rounded-[12px] border text-sm font-medium",
                    tab === "recepten"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Mijn recepten
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      tab === "producten" ? "Zoek een product…" : "Zoek een recept…"
                    }
                    className="h-11 rounded-[12px] pl-9 text-base"
                    autoFocus
                  />
                </div>
                {tab === "producten" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScanning(true)}
                    aria-label="Scan barcode"
                    className="h-11 w-11 rounded-[12px] p-0"
                  >
                    <Barcode className="size-5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto px-4 pb-4">
              {searching && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Zoeken…
                </p>
              )}

              {!searching && tab === "producten" && (
                <>
                  {products.map((product) => (
                    <button
                      key={product.id ?? product.off_barcode}
                      type="button"
                      onClick={() => setSelection({ type: "product", product })}
                      className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
                    >
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          {product.is_favorite && (
                            <Star className="size-3.5 fill-warning text-warning" />
                          )}
                          {product.name}
                        </span>
                        {product.brand && (
                          <span className="text-xs text-muted-foreground">
                            {product.brand}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {Math.round(product.calories_per_100g)} kcal/100g
                      </span>
                    </button>
                  ))}
                  {query.trim().length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(true)}
                      className="flex min-h-14 items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground"
                    >
                      <Plus className="size-4" />
                      &ldquo;{query}&rdquo; toevoegen als eigen product
                    </button>
                  )}
                  {query.trim().length < 2 && products.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Typ minstens 2 tekens om te zoeken.
                    </p>
                  )}
                </>
              )}

              {!searching && tab === "recepten" && (
                <>
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => setSelection({ type: "recipe", recipe })}
                      className="flex min-h-14 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-medium"
                    >
                      {recipe.is_favorite && (
                        <Star className="size-3.5 fill-warning text-warning" />
                      )}
                      {recipe.title}
                    </button>
                  ))}
                  {recipes.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Geen recepten gevonden.
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function QuantityStep({
  selection,
  entryDate,
  isPending,
  onBack,
  onSubmit,
}: {
  selection: Selection;
  entryDate: string;
  isPending: boolean;
  onBack: () => void;
  onSubmit: (formData: FormData, kind: "product" | "recipe") => void;
}) {
  const [mealType, setMealType] = useState<MealType>(defaultMealType());

  const title =
    selection.type === "product" ? selection.product.name : selection.recipe.title;

  return (
    <form
      action={(formData) => {
        formData.set("meal_type", mealType);
        formData.set("entry_date", entryDate);
        if (selection.type === "product") {
          formData.set("product_id", selection.product.id ?? "");
        } else {
          formData.set("recipe_id", selection.recipe.id);
        }
        onSubmit(formData, selection.type);
      }}
    >
      <DrawerHeader>
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>
          {selection.type === "product"
            ? "Hoeveel gram heb je gegeten?"
            : "Hoeveel porties heb je gegeten?"}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-5 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">
            {selection.type === "product" ? "Hoeveelheid (g)" : "Aantal porties"}
          </Label>
          <Input
            id="amount"
            name={selection.type === "product" ? "quantity_g" : "servings"}
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            defaultValue={selection.type === "product" ? 100 : 1}
            required
            className="h-11 rounded-[12px] text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Maaltijd</Label>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMealType(option.value)}
                className={cn(
                  "min-h-11 rounded-[12px] border px-1 text-xs font-medium",
                  mealType === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-[12px] text-base"
        >
          {isPending ? "Bezig met opslaan…" : "Toevoegen aan dagboek"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="h-11 rounded-[12px] text-base"
        >
          Terug
        </Button>
      </div>
    </form>
  );
}

function CustomProductStep({
  initialName,
  isPending,
  onBack,
  onCreated,
  startTransition,
}: {
  initialName: string;
  isPending: boolean;
  onBack: () => void;
  onCreated: (product: SearchResultProduct) => void;
  startTransition: (fn: () => void | Promise<void>) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await createCustomProduct(formData);
          if (!result.success) {
            setError(result.error);
            return;
          }
          onCreated({
            id: result.data.productId,
            off_barcode: null,
            name: String(formData.get("name")),
            brand: null,
            calories_per_100g: Number(formData.get("calories_per_100g")),
            protein_per_100g: Number(formData.get("protein_per_100g")),
            carbs_per_100g: Number(formData.get("carbs_per_100g")),
            fat_per_100g: Number(formData.get("fat_per_100g")),
            is_favorite: false,
            is_off: false,
          });
        });
      }}
    >
      <DrawerHeader>
        <DrawerTitle>Eigen product toevoegen</DrawerTitle>
        <DrawerDescription>Vul de voedingswaarden per 100 g in.</DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-4 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Naam</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialName}
            required
            className="h-11 rounded-[12px] text-base"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="calories_per_100g">Kcal / 100g</Label>
            <Input
              id="calories_per_100g"
              name="calories_per_100g"
              type="number"
              inputMode="decimal"
              min={0}
              required
              className="h-11 rounded-[12px] text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="protein_per_100g">Eiwit (g) / 100g</Label>
            <Input
              id="protein_per_100g"
              name="protein_per_100g"
              type="number"
              inputMode="decimal"
              min={0}
              required
              className="h-11 rounded-[12px] text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="carbs_per_100g">Koolhydraten (g) / 100g</Label>
            <Input
              id="carbs_per_100g"
              name="carbs_per_100g"
              type="number"
              inputMode="decimal"
              min={0}
              required
              className="h-11 rounded-[12px] text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fat_per_100g">Vet (g) / 100g</Label>
            <Input
              id="fat_per_100g"
              name="fat_per_100g"
              type="number"
              inputMode="decimal"
              min={0}
              required
              className="h-11 rounded-[12px] text-base"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-[12px] text-base"
        >
          {isPending ? "Bezig met opslaan…" : "Product opslaan"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="h-11 rounded-[12px] text-base"
        >
          Terug
        </Button>
      </div>
    </form>
  );
}
