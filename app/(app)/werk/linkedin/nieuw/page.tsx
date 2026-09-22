import { LinkedinIdeaForm } from "@/components/werk/LinkedinIdeaForm";
import { createLinkedinIdea } from "@/app/(app)/werk/linkedin/actions";

export default function NieuwLinkedinIdeePage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="px-4 font-heading text-2xl font-bold">Nieuw idee</h1>
      <LinkedinIdeaForm mode="create" action={createLinkedinIdea} />
    </div>
  );
}
