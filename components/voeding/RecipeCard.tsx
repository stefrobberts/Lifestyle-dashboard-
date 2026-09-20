import Link from "next/link";
import Image from "next/image";
import { ChefHat, Star } from "lucide-react";

export function RecipeCard({
  id,
  title,
  photoUrl,
  tags,
  isFavorite,
  caloriesPerServing,
}: {
  id: string;
  title: string;
  photoUrl: string | null;
  tags: string[];
  isFavorite: boolean;
  caloriesPerServing: number;
}) {
  return (
    <Link
      href={`/voeding/recepten/${id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
    >
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
        {photoUrl ? (
          <Image src={photoUrl} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <ChefHat className="size-6" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {isFavorite && <Star className="size-3.5 fill-warning text-warning" />}
          {title}
        </span>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {caloriesPerServing} kcal
      </span>
    </Link>
  );
}
