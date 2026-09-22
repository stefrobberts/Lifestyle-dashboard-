import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchLinkedinIdea, getLinkedinImageUrl } from "@/lib/data/work";
import { LinkedinDetailActions } from "@/components/werk/LinkedinDetailActions";
import { CopyButton } from "@/components/werk/CopyButton";

export default async function LinkedinIdeeDetailPage(
  props: PageProps<"/werk/linkedin/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const idea = await fetchLinkedinIdea(supabase, id);

  if (!idea) notFound();

  const imageUrl = await getLinkedinImageUrl(supabase, idea.image_path);
  const fullText = [idea.hook, idea.body].filter(Boolean).join("\n\n");

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <Link
        href="/werk/linkedin"
        className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground"
      >
        <ChevronLeft className="size-5" />
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold">{idea.subject}</h1>
        {idea.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}

      <LinkedinDetailActions
        ideaId={idea.id}
        subject={idea.subject}
        status={idea.status as "idee" | "concept" | "gepland" | "gepubliceerd"}
      />

      {fullText && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tekst
          </p>
          {idea.hook && <p className="font-medium">{idea.hook}</p>}
          {idea.body && (
            <p className="text-sm whitespace-pre-wrap text-foreground">{idea.body}</p>
          )}
          <CopyButton text={fullText} />
        </div>
      )}
    </div>
  );
}
