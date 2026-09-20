import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchRecipeDetail } from "@/lib/data/recipes";
import { RecipeForm } from "@/components/voeding/RecipeForm";
import { updateRecipe } from "@/app/(app)/voeding/recepten/actions";
import type { RecipeTag } from "@/lib/validations/recipe";

export default async function BewerkReceptPage(
  props: PageProps<"/voeding/recepten/[id]/bewerken">
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const recipe = await fetchRecipeDetail(supabase, id);

  if (!recipe) notFound();

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="px-4 font-heading text-2xl font-bold">Recept bewerken</h1>
      <RecipeForm
        mode="edit"
        action={updateRecipe.bind(null, recipe.id)}
        initialValues={{
          title: recipe.title,
          instructions: recipe.instructions ?? "",
          servings: recipe.servings,
          tags: recipe.tags as RecipeTag[],
          photoUrl: recipe.photoUrl,
          ingredients: recipe.recipe_ingredients.map((ri) => ({
            product_id: ri.product_id,
            name: ri.products!.name,
            quantity_g: ri.quantity_g,
            macros: {
              calories_per_100g: ri.products!.calories_per_100g,
              protein_per_100g: ri.products!.protein_per_100g,
              carbs_per_100g: ri.products!.carbs_per_100g,
              fat_per_100g: ri.products!.fat_per_100g,
            },
          })),
        }}
      />
    </div>
  );
}
