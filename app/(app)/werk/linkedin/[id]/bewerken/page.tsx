import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchLinkedinIdea, getLinkedinImageUrl } from "@/lib/data/work";
import { LinkedinIdeaForm } from "@/components/werk/LinkedinIdeaForm";
import { updateLinkedinIdea } from "@/app/(app)/werk/linkedin/actions";

export default async function BewerkLinkedinIdeePage(
  props: PageProps<"/werk/linkedin/[id]/bewerken">
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const idea = await fetchLinkedinIdea(supabase, id);

  if (!idea) notFound();

  const imageUrl = await getLinkedinImageUrl(supabase, idea.image_path);

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="px-4 font-heading text-2xl font-bold">Idee bewerken</h1>
      <LinkedinIdeaForm
        mode="edit"
        action={updateLinkedinIdea.bind(null, idea.id)}
        initialValues={{
          subject: idea.subject,
          hook: idea.hook ?? "",
          body: idea.body ?? "",
          tags: idea.tags,
          status: idea.status as "idee" | "concept" | "gepland" | "gepubliceerd",
          plannedDate: idea.planned_date ?? "",
          imageUrl,
        }}
      />
    </div>
  );
}
