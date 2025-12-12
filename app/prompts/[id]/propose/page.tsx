import { requireMember } from "@/lib/auth/requireMember";
import { supabaseServer } from "@/lib/supabase/server";
import { createProposal } from "../../../../actions/prompts";
import { redirect } from "next/navigation";

export default async function ProposePage({ params }: { params: { id: string } }) {
  await requireMember();
  const supabase = supabaseServer();
  const promptId = params.id;

  const { data: prompt, error: pErr } = await supabase
    .from("prompts")
    .select("id,title,current_version_id")
    .eq("id", promptId)
    .single();
  if (pErr) throw pErr;
  if (!prompt) throw new Error("Prompt introuvable");
  const promptTitle = prompt.title;
  const baseVersionId = prompt.current_version_id;

  const { data: baseVersion, error: vErr } = await supabase
    .from("prompt_versions")
    .select("id,version_number,content")
    .eq("id", baseVersionId)
    .single();
  if (vErr) throw vErr;
  if (!baseVersion) throw new Error("Version de base introuvable");
  const baseVersionContent = baseVersion.content;
  const baseVersionNumber = baseVersion.version_number;
  const baseVersionIdNonNull = baseVersion.id;

  async function onSubmit(formData: FormData) {
    "use server";
    await createProposal(promptId, baseVersionIdNonNull, formData);
    redirect(`/prompts/${promptId}`);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Proposer une amélioration</h1>
      <p className="text-sm text-slate-700">
        Prompt : <span className="font-medium">{promptTitle}</span> (base v{baseVersionNumber})
      </p>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="text-sm font-medium">Version de base</div>
        <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm">{baseVersionContent}</pre>
      </div>

      <form action={onSubmit} className="space-y-3 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Votre version améliorée</label>
          <textarea
            name="proposed_content"
            className="w-full rounded-md border px-3 py-2 text-sm font-mono"
            rows={10}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Justification (optionnel)</label>
          <textarea name="rationale" className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
        </div>

        <p className="text-sm text-slate-700">
          Rappel : ne saisissez pas de données personnelles (nom, adresse, téléphone, situation identifiable).
        </p>

        <button className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
          Publier la proposition
        </button>
      </form>
    </div>
  );
}