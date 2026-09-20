import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchRecipes } from "@/lib/data/recipes";
import { RecipeCard } from "@/components/voeding/RecipeCard";

export default async function ReceptenPage() {
  const supabase = await createClient();
  const recipes = await fetchRecipes(supabase);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Recepten</h1>
        <Link
          href="/voeding/recepten/nieuw"
          className="flex h-11 items-center gap-1.5 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Nieuw
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen recepten. Voeg je eerste recept toe, inclusief foto en
            ingrediënten — de macro&apos;s per portie worden automatisch berekend.
          </p>
          <Link
            href="/voeding/recepten/nieuw"
            className="flex h-11 items-center gap-1.5 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <Plus className="size-4" />
            Recept toevoegen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              photoUrl={recipe.photoUrl}
              tags={recipe.tags}
              isFavorite={recipe.is_favorite}
              caloriesPerServing={recipe.perServing.calories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
