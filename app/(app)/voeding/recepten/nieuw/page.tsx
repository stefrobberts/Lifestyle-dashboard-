import { RecipeForm } from "@/components/voeding/RecipeForm";
import { createRecipe } from "@/app/(app)/voeding/recepten/actions";

export default function NieuwReceptPage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="px-4 font-heading text-2xl font-bold">Nieuw recept</h1>
      <RecipeForm mode="create" action={createRecipe} />
    </div>
  );
}
