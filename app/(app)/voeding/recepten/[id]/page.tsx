import Image from "next/image";
import Link from "next/link";
import { ChefHat, ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchRecipeDetail } from "@/lib/data/recipes";
import { RecipeDetailActions } from "@/components/voeding/RecipeDetailActions";
import { LogRecipeButton } from "@/components/voeding/LogRecipeButton";

export default async function ReceptDetailPage(props: PageProps<"/voeding/recepten/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const recipe = await fetchRecipeDetail(supabase, id);

  if (!recipe) notFound();

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="relative aspect-square w-full bg-muted">
        {recipe.photoUrl ? (
          <Image
            src={recipe.photoUrl}
            alt={recipe.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ChefHat className="size-12" />
          </div>
        )}
        <Link
          href="/voeding/recepten"
          aria-label="Terug naar recepten"
          className="safe-top absolute top-4 left-4 flex size-11 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur"
        >
          <ChevronLeft className="size-5" />
        </Link>
      </div>

      <div className="flex flex-col gap-6 px-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold">{recipe.title}</h1>
            <div className="mt-1 flex flex-wrap gap-1">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <RecipeDetailActions
            recipeId={recipe.id}
            title={recipe.title}
            isFavorite={recipe.is_favorite}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-4 text-center">
          <div>
            <p className="font-heading text-lg font-bold tabular-nums">
              {recipe.perServing.calories}
            </p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="font-heading text-lg font-bold tabular-nums">
              {recipe.perServing.protein_g}
            </p>
            <p className="text-[10px] text-muted-foreground">g eiwit</p>
          </div>
          <div>
            <p className="font-heading text-lg font-bold tabular-nums">
              {recipe.perServing.carbs_g}
            </p>
            <p className="text-[10px] text-muted-foreground">g koolh.</p>
          </div>
          <div>
            <p className="font-heading text-lg font-bold tabular-nums">
              {recipe.perServing.fat_g}
            </p>
            <p className="text-[10px] text-muted-foreground">g vet</p>
          </div>
        </div>
        <p className="-mt-4 text-center text-xs text-muted-foreground">
          per portie · {recipe.servings}{" "}
          {recipe.servings === 1 ? "portie" : "porties"} totaal
        </p>

        <LogRecipeButton recipeId={recipe.id} />

        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Ingrediënten
          </h2>
          <div className="flex flex-col gap-2">
            {recipe.recipe_ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span>{ingredient.products?.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {ingredient.quantity_g} g
                </span>
              </div>
            ))}
          </div>
        </div>

        {recipe.instructions && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Bereiding
            </h2>
            <p className="text-sm whitespace-pre-wrap text-foreground">
              {recipe.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
