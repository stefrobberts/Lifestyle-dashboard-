"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { searchProducts, type SearchResultProduct } from "@/lib/data/products";
import { calculateRecipeMacros } from "@/lib/nutrition";
import type { RecipeTag } from "@/lib/validations/recipe";

const TAG_OPTIONS: { value: RecipeTag; label: string }[] = [
  { value: "ontbijt", label: "Ontbijt" },
  { value: "lunch", label: "Lunch" },
  { value: "diner", label: "Diner" },
  { value: "snack", label: "Snack" },
  { value: "eiwitrijk", label: "Eiwitrijk" },
];

type IngredientRow = {
  product_id: string;
  name: string;
  quantity_g: number;
  macros: {
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
  };
};

type FormState = { status: "idle" | "error"; message?: string };

export function RecipeForm({
  mode,
  initialValues,
  action,
}: {
  mode: "create" | "edit";
  initialValues?: {
    title: string;
    instructions: string;
    servings: number;
    tags: RecipeTag[];
    photoUrl: string | null;
    ingredients: IngredientRow[];
  };
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [servings, setServings] = useState(initialValues?.servings ?? 2);
  const [tags, setTags] = useState<RecipeTag[]>(initialValues?.tags ?? []);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialValues?.ingredients ?? []
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialValues?.photoUrl ?? null
  );
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientResults, setIngredientResults] = useState<SearchResultProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      formData.set(
        "ingredients_json",
        JSON.stringify(
          ingredients.map((i) => ({
            product_id: i.product_id,
            quantity_g: i.quantity_g,
          }))
        )
      );
      const result = await action(formData);
      if (!result.success) {
        return { status: "error", message: result.error };
      }
      return { status: "idle" };
    },
    { status: "idle" }
  );

  const { perServing } = useMemo(
    () =>
      calculateRecipeMacros(
        ingredients.map((i) => ({ product: i.macros, quantity_g: i.quantity_g })),
        servings
      ),
    [ingredients, servings]
  );

  function handleIngredientSearch(value: string) {
    setIngredientQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setIngredientResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProducts(value);
        setIngredientResults(results.filter((r) => r.id));
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function addIngredient(product: SearchResultProduct) {
    if (!product.id) return;
    setIngredients((current) => [
      ...current,
      {
        product_id: product.id!,
        name: product.name,
        quantity_g: 100,
        macros: {
          calories_per_100g: product.calories_per_100g,
          protein_per_100g: product.protein_per_100g,
          carbs_per_100g: product.carbs_per_100g,
          fat_per_100g: product.fat_per_100g,
        },
      },
    ]);
    setIngredientQuery("");
    setIngredientResults([]);
  }

  function updateQuantity(index: number, grams: number) {
    setIngredients((current) =>
      current.map((ing, i) => (i === index ? { ...ing, quantity_g: grams } : ing))
    );
  }

  function removeIngredient(index: number) {
    setIngredients((current) => current.filter((_, i) => i !== index));
  }

  function toggleTag(tag: RecipeTag) {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 px-4 pb-24">
      <div className="flex flex-col items-center gap-3">
        <label
          htmlFor="photo"
          className="relative flex size-32 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground"
        >
          {photoPreview ? (
            <Image src={photoPreview} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <Camera className="size-8" />
          )}
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <label htmlFor="photo" className="text-xs font-medium text-primary">
          {photoPreview ? "Andere foto maken" : "Foto maken"}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initialValues?.title}
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={cn(
                "min-h-9 rounded-full border px-3 text-sm font-medium",
                tags.includes(tag.value)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
        {tags.map((tag) => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="servings">Aantal porties</Label>
        <Input
          id="servings"
          name="servings"
          type="number"
          inputMode="numeric"
          min={1}
          required
          value={servings}
          onChange={(e) => setServings(Number(e.target.value) || 1)}
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Ingrediënten</Label>

        {ingredients.length > 0 && (
          <div className="flex flex-col gap-2">
            {ingredients.map((ingredient, index) => (
              <div
                key={`${ingredient.product_id}-${index}`}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2"
              >
                <span className="flex-1 text-sm">{ingredient.name}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={ingredient.quantity_g}
                  onChange={(e) => updateQuantity(index, Number(e.target.value) || 0)}
                  className="h-9 w-20 rounded-[10px] text-sm"
                />
                <span className="text-xs text-muted-foreground">g</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  aria-label="Verwijder ingrediënt"
                  className="flex size-9 items-center justify-center text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={ingredientQuery}
            onChange={(e) => handleIngredientSearch(e.target.value)}
            placeholder="Zoek een ingrediënt…"
            className="h-11 rounded-[12px] pl-9 text-base"
          />
        </div>

        {searching && (
          <p className="text-center text-sm text-muted-foreground">Zoeken…</p>
        )}

        {ingredientResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {ingredientResults.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addIngredient(product)}
                className="flex min-h-11 items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2 text-left text-sm"
              >
                <Plus className="size-4 text-primary" />
                {product.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Per portie
          </p>
          <p className="font-heading text-xl font-bold tabular-nums">
            {perServing.calories} kcal
          </p>
          <p className="text-xs text-muted-foreground">
            {perServing.protein_g} g eiwit · {perServing.carbs_g} g koolhydraten ·{" "}
            {perServing.fat_g} g vet
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="instructions">Bereiding (optioneel)</Label>
        <textarea
          id="instructions"
          name="instructions"
          rows={5}
          defaultValue={initialValues?.instructions}
          className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-base outline-none focus:border-primary"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending || ingredients.length === 0}
        className="h-11 rounded-[12px] text-base"
      >
        {isPending
          ? "Bezig met opslaan…"
          : mode === "create"
            ? "Recept opslaan"
            : "Wijzigingen opslaan"}
      </Button>
    </form>
  );
}
